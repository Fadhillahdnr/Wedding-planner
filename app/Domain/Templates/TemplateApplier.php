<?php

namespace App\Domain\Templates;

use App\Domain\Budget\BudgetAllocator;
use App\Domain\Timeline\TimelineScheduler;
use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\ScoreCriterion;
use App\Models\Task;
use App\Models\VendorSlot;
use App\Models\Wedding;
use Illuminate\Support\Facades\DB;

/**
 * Menyalin template ke workspace. Idempotent: hanya membuat yang belum ada (berdasarkan nama),
 * tidak pernah mengubah atau menghapus data yang sudah ada, sehingga menjalankannya ulang aman.
 */
class TemplateApplier
{
    public function __construct(
        private readonly BudgetAllocator $allocator,
        private readonly TimelineScheduler $scheduler,
    ) {}

    public function apply(Wedding $wedding): void
    {
        // Model yang baru dibuat belum memuat nilai default kolom dari database.
        $wedding->refresh();

        DB::transaction(function () use ($wedding) {
            $categories = $this->categories($wedding);
            $slots = $this->slots($wedding, $categories);
            $this->tasks($wedding, $slots);
            $this->criteria($wedding);
        });
    }

    /** @return array<string,BudgetCategory> */
    private function categories(Wedding $wedding): array
    {
        $weights = BudgetAllocator::TEMPLATE_WEIGHTS;
        $amounts = $wedding->total_budget
            ? $this->allocator->allocate($wedding->total_budget, $wedding->contingency_percent)['categories']
            : array_fill_keys(array_keys($weights), 0);

        $names = array_keys($weights);
        if ($wedding->include_prewedding) {
            $names[] = 'Pre-wedding';
        }
        if ($wedding->include_honeymoon) {
            $names[] = 'Honeymoon';
        }

        $result = [];
        foreach ($names as $order => $name) {
            $existing = BudgetCategory::withoutGlobalScopes()->where('wedding_id', $wedding->id)->where('name', $name)->first();
            $result[$name] = $existing ?? $this->make(new BudgetCategory, $wedding, [
                'name' => $name,
                'allocated_amount' => $amounts[$name] ?? 0,
                'sort_order' => $order,
                'source' => 'template',
            ]);
        }

        return $result;
    }

    /**
     * @param  array<string,BudgetCategory>  $categories
     * @return array<string,VendorSlot>
     */
    private function slots(Wedding $wedding, array $categories): array
    {
        $result = [];

        foreach (WeddingTemplates::VENDOR_SLOTS as $order => $def) {
            $existing = VendorSlot::withoutGlobalScopes()->where('wedding_id', $wedding->id)->where('name', $def['name'])->first();

            if ($existing) {
                $result[$def['name']] = $existing;

                continue;
            }

            $category = $categories[$def['category']] ?? null;
            if ($category === null) {
                continue; // Pre-wedding/Honeymoon dilewati bila tidak dihitung dalam anggaran.
            }

            $item = $this->make(new BudgetItem, $wedding, [
                'budget_category_id' => $category->id,
                'name' => $def['name'],
                'pricing_mode' => $def['per_guest'] ? 'per_guest' : 'fixed',
                'sort_order' => $order,
                'source' => 'template',
            ]);

            $result[$def['name']] = $this->make(new VendorSlot, $wedding, [
                'budget_item_id' => $item->id,
                'name' => $def['name'],
                'need' => $def['need'],
                'ideal_months_before' => $def['months'],
                'sort_order' => $order,
                'source' => 'template',
            ]);
        }

        return $result;
    }

    /** @param  array<string,VendorSlot>  $slots */
    private function tasks(Wedding $wedding, array $slots): void
    {
        $reference = $wedding->referenceDate();

        foreach (WeddingTemplates::tasks() as $def) {
            $exists = Task::withoutGlobalScopes()->where('wedding_id', $wedding->id)->where('title', $def['title'])->exists();
            if ($exists) {
                continue;
            }

            $this->make(new Task, $wedding, [
                'title' => $def['title'],
                'phase' => $def['phase'],
                'offset_value' => $def['value'],
                'offset_unit' => $def['unit'],
                'due_date' => $reference ? $this->scheduler->dueDate($reference, $def['value'], $def['unit'])->toDateString() : null,
                'vendor_slot_id' => isset($def['slot']) ? ($slots[$def['slot']]->id ?? null) : null,
                'source' => 'template',
            ]);
        }
    }

    private function criteria(Wedding $wedding): void
    {
        foreach (WeddingTemplates::SCORE_CRITERIA as $order => $name) {
            if (ScoreCriterion::withoutGlobalScopes()->where('wedding_id', $wedding->id)->where('name', $name)->exists()) {
                continue;
            }

            $this->make(new ScoreCriterion, $wedding, ['name' => $name, 'weight' => 1, 'sort_order' => $order]);
        }
    }

    /**
     * Membuat record untuk wedding tertentu tanpa bergantung pada pengguna yang sedang login,
     * karena applier juga dipakai dari console.
     *
     * @template T of \Illuminate\Database\Eloquent\Model
     *
     * @param  T  $model
     * @param  array<string,mixed>  $attributes
     * @return T
     */
    private function make($model, Wedding $wedding, array $attributes)
    {
        $model->forceFill($attributes + ['wedding_id' => $wedding->id])->save();

        return $model;
    }
}
