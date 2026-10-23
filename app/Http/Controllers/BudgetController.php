<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetItemRequest;
use App\Http\Requests\PaymentRequest;
use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\FundingSource;
use App\Models\Payment;
use App\Services\ActivityLogger;
use App\Services\BudgetOverview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request, BudgetOverview $overview)
    {
        $wedding = $request->user()->wedding();

        return Inertia::render('budget/index', [
            ...$overview->build($wedding, now($wedding->timezone)->startOfDay()),
            'wedding' => $wedding->only('guest_estimate', 'total_budget', 'contingency_percent', 'price_buffer_percent'),
            'payments' => Payment::query()->with('item:id,name')->orderBy('due_date')->get()->map(fn ($p) => [
                'id' => $p->id,
                'budget_item_id' => $p->budget_item_id,
                'item' => $p->item?->name,
                'label' => $p->label,
                'amount' => $p->amount,
                'due_date' => $p->due_date?->toDateString(),
                'status' => $p->status->value,
                'paid_on' => $p->paid_on?->toDateString(),
                'method' => $p->method,
                'notes' => $p->notes,
            ]),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'allocated_amount' => ['nullable', 'integer', 'min:0', 'max:100000000000000'],
        ]);

        BudgetCategory::create([
            'name' => $data['name'],
            'allocated_amount' => $data['allocated_amount'] ?? 0,
            'sort_order' => (int) BudgetCategory::query()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Kategori ditambahkan.');
    }

    public function updateCategory(Request $request, BudgetCategory $category)
    {
        $category->update($request->validate([
            'name' => ['required', 'string', 'max:100'],
            'allocated_amount' => ['required', 'integer', 'min:0', 'max:100000000000000'],
        ]));

        return back()->with('success', 'Kategori diperbarui.');
    }

    public function destroyCategory(BudgetCategory $category, ActivityLogger $log)
    {
        $log->record('budget.category.deleted', ['name' => $category->name, 'items' => $category->items()->count()]);
        $category->delete();

        return back()->with('success', 'Kategori dihapus.');
    }

    public function storeItem(BudgetItemRequest $request)
    {
        BudgetItem::create($request->validated());

        return back()->with('success', 'Item ditambahkan.');
    }

    public function updateItem(BudgetItemRequest $request, BudgetItem $item)
    {
        $item->update($request->validated());

        return back()->with('success', 'Item diperbarui.');
    }

    public function destroyItem(BudgetItem $item, ActivityLogger $log)
    {
        $log->record('budget.item.deleted', ['name' => $item->name]);
        $item->delete();

        return back()->with('success', 'Item dihapus.');
    }

    public function storeFunding(Request $request)
    {
        FundingSource::create($this->fundingData($request));

        return back()->with('success', 'Sumber dana ditambahkan.');
    }

    public function updateFunding(Request $request, FundingSource $funding)
    {
        $funding->update($this->fundingData($request));

        return back()->with('success', 'Sumber dana diperbarui.');
    }

    public function destroyFunding(FundingSource $funding)
    {
        $funding->delete();

        return back()->with('success', 'Sumber dana dihapus.');
    }

    public function storePayment(PaymentRequest $request)
    {
        Payment::create($request->validated());

        return back()->with('success', 'Pembayaran dicatat.');
    }

    public function updatePayment(PaymentRequest $request, Payment $payment)
    {
        $payment->update($request->validated());

        return back()->with('success', 'Pembayaran diperbarui.');
    }

    public function destroyPayment(Payment $payment, ActivityLogger $log)
    {
        $log->record('payment.deleted', ['label' => $payment->label]);
        $payment->delete();

        return back()->with('success', 'Pembayaran dihapus.');
    }

    /** @return array<string,mixed> */
    private function fundingData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'collected_amount' => ['required', 'integer', 'min:0', 'max:100000000000000'],
            'target_amount' => ['nullable', 'integer', 'min:0', 'max:100000000000000'],
            'monthly_contribution' => ['required', 'integer', 'min:0', 'max:100000000000000'],
        ]);
    }
}
