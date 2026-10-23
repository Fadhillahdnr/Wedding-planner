<?php

namespace App\Services;

use App\Domain\Budget\BudgetCalculator;
use App\Domain\Budget\SavingsPlanner;
use App\Models\BudgetCategory;
use App\Models\FundingSource;
use App\Models\Wedding;
use Carbon\CarbonInterface;

/** Menjembatani database dan class hitung murni; satu-satunya tempat angka anggaran dirakit untuk UI. */
class BudgetOverview
{
    public function __construct(
        private readonly BudgetCalculator $calculator,
        private readonly SavingsPlanner $savings,
    ) {}

    /** @return array<string,mixed> */
    public function build(Wedding $wedding, CarbonInterface $today): array
    {
        $categories = BudgetCategory::query()
            ->with(['items' => fn ($q) => $q->withSum(['payments as paid' => fn ($p) => $p->where('status', 'lunas')], 'amount')])
            ->orderBy('sort_order')
            ->get();

        $rows = [];
        foreach ($categories as $category) {
            foreach ($category->items as $item) {
                $rows[] = [
                    'id' => $item->id,
                    'pricing_mode' => $item->pricing_mode->value,
                    'estimate_min' => $item->estimate_min,
                    'estimate_max' => $item->estimate_max,
                    'price_per_guest' => $item->price_per_guest,
                    'agreed_amount' => $item->agreed_amount,
                    'paid' => (int) $item->paid,
                ];
            }
        }

        $summary = $this->calculator->summarize(
            $rows,
            $wedding->guest_estimate,
            $wedding->total_budget,
            $wedding->contingency_percent,
            $wedding->price_buffer_percent,
            $wedding->warning_threshold_percent,
        );

        $funding = FundingSource::query()->orderBy('id')->get();
        $plan = $this->savings->plan(
            $summary['projected_total'],
            (int) $funding->sum('collected_amount'),
            (int) $funding->sum('monthly_contribution'),
            $wedding->referenceDate(),
            $today,
        );

        return [
            'summary' => $summary + ['status_label' => $summary['status']->label(), 'status_value' => $summary['status']->value],
            'categories' => $categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'allocated_amount' => $category->allocated_amount,
                'projected' => $category->items->sum(fn ($item) => $summary['items'][$item->id]['projected']),
                'items' => $category->items->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'pricing_mode' => $item->pricing_mode->value,
                    'estimate_min' => $item->estimate_min,
                    'estimate_max' => $item->estimate_max,
                    'price_per_guest' => $item->price_per_guest,
                    'agreed_amount' => $item->agreed_amount,
                    'notes' => $item->notes,
                    'estimate_mid' => $summary['items'][$item->id]['estimate']['mid'],
                    'projected' => $summary['items'][$item->id]['projected'],
                    'paid' => $summary['items'][$item->id]['paid'],
                    'overpaid' => in_array($item->id, $summary['overpaid_items'], true),
                ])->values(),
            ])->values(),
            'funding' => $funding->map(fn ($source) => $source->only('id', 'name', 'collected_amount', 'target_amount', 'monthly_contribution'))->values(),
            'plan' => [
                ...$plan,
                'meet_date' => $plan['meet_date']?->toDateString(),
            ],
        ];
    }
}
