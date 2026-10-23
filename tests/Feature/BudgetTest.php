<?php

use App\Domain\Templates\TemplateApplier;
use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\FundingSource;
use App\Models\Payment;
use App\Models\Wedding;

function budgetSetup(array $wedding = []): array
{
    [$user, $w] = workspace($wedding);
    // Dibuat sebelum login, jadi workspace diberikan eksplisit.
    $category = (new BudgetCategory)->forceFill(['name' => 'Katering', 'wedding_id' => $w->id]);
    $category->save();

    return [$user, $w, $category];
}

it('creates items and returns the three separate figures', function () {
    [$user, , $category] = budgetSetup(['guest_estimate' => 100, 'total_budget' => 100_000_000]);
    $this->actingAs($user);

    $this->post('/anggaran/item', ['budget_category_id' => $category->id, 'name' => 'Paket makan', 'pricing_mode' => 'per_guest', 'price_per_guest' => 150_000])->assertRedirect();
    $this->post('/anggaran/item', ['budget_category_id' => $category->id, 'name' => 'Tenda', 'pricing_mode' => 'fixed', 'estimate_min' => 4_000_000, 'estimate_max' => 6_000_000])->assertRedirect();

    $this->get('/anggaran')->assertInertia(fn ($page) => $page
        ->where('summary.subtotal', 20_000_000)
        ->where('summary.contingency', 1_200_000)
        ->where('summary.projected_total', 21_200_000)
        ->where('summary.status_value', 'aman')
        ->where('categories.0.items.0.estimate_mid', 15_000_000));
});

it('recomputes per-guest items when the guest estimate changes', function () {
    [$user, , $category] = budgetSetup(['guest_estimate' => 100]);
    $this->actingAs($user);
    $this->post('/anggaran/item', ['budget_category_id' => $category->id, 'name' => 'Katering', 'pricing_mode' => 'per_guest', 'price_per_guest' => 100_000]);

    $this->put('/pengaturan/pernikahan', settingsPayload(['guest_estimate' => 300]))->assertRedirect();

    $this->get('/anggaran')->assertInertia(fn ($page) => $page->where('summary.subtotal', 30_000_000));
});

function settingsPayload(array $over = []): array
{
    return array_merge([
        'timezone' => 'Asia/Jakarta',
        'contingency_percent' => 0,
        'price_buffer_percent' => 0,
        'warning_threshold_percent' => 90,
        'guest_estimate' => 100,
    ], $over);
}

it('uses lunas payments for the paid figure and flags overpayment', function () {
    [$user, $w, $category] = budgetSetup();
    $this->actingAs($user);
    $item = (new BudgetItem)->forceFill(['wedding_id' => $w->id, 'budget_category_id' => $category->id, 'name' => 'Venue', 'agreed_amount' => 10_000_000]);
    $item->save();

    $this->post('/anggaran/pembayaran', ['budget_item_id' => $item->id, 'label' => 'DP', 'amount' => 4_000_000, 'status' => 'lunas', 'paid_on' => '2026-10-01'])->assertRedirect();
    $this->post('/anggaran/pembayaran', ['budget_item_id' => $item->id, 'label' => 'Termin', 'amount' => 3_000_000, 'status' => 'direncanakan', 'due_date' => '2026-12-01'])->assertRedirect();

    $this->get('/anggaran')->assertInertia(fn ($page) => $page
        ->where('summary.paid_total', 4_000_000)
        ->where('summary.remaining_to_pay', 6_000_000)
        ->where('summary.overpaid_items', []));

    $this->post('/anggaran/pembayaran', ['budget_item_id' => $item->id, 'label' => 'Lebih', 'amount' => 7_000_000, 'status' => 'lunas', 'paid_on' => '2026-10-02']);
    $this->get('/anggaran')->assertInertia(fn ($page) => $page->where('categories.0.items.0.overpaid', true));
});

it('requires a paid date when a payment is marked lunas', function () {
    [$user, $w, $category] = budgetSetup();
    $item = (new BudgetItem)->forceFill(['wedding_id' => $w->id, 'budget_category_id' => $category->id, 'name' => 'Venue']);
    $item->save();

    $this->actingAs($user)->post('/anggaran/pembayaran', ['budget_item_id' => $item->id, 'label' => 'DP', 'amount' => 1, 'status' => 'lunas'])->assertSessionHasErrors('paid_on');
});

it('validates the estimate range and money bounds', function () {
    [$user, , $category] = budgetSetup();
    $this->actingAs($user)->post('/anggaran/item', ['budget_category_id' => $category->id, 'name' => 'X', 'pricing_mode' => 'fixed', 'estimate_min' => 9, 'estimate_max' => 3])->assertSessionHasErrors('estimate_max');
    $this->post('/anggaran/item', ['budget_category_id' => $category->id, 'name' => 'X', 'pricing_mode' => 'fixed', 'estimate_min' => -1])->assertSessionHasErrors('estimate_min');
    $this->post('/anggaran/item', ['budget_category_id' => $category->id, 'name' => 'X', 'pricing_mode' => 'bogus'])->assertSessionHasErrors('pricing_mode');
});

it('shows the savings plan from funding sources', function () {
    [$user, $w] = budgetSetup(['target_month' => now()->addMonths(10)->startOfMonth()]);
    $this->actingAs($user);
    $category = BudgetCategory::first();
    BudgetItem::create(['budget_category_id' => $category->id, 'name' => 'Semua', 'estimate_min' => 100_000_000]);

    $this->post('/anggaran/dana', ['name' => 'Tabungan', 'collected_amount' => 20_000_000, 'monthly_contribution' => 5_000_000])->assertRedirect();

    $this->get('/anggaran')->assertInertia(fn ($page) => $page
        ->where('summary.projected_total', 106_000_000)
        ->where('plan.need', 86_000_000)
        ->where('plan.planned_per_month', 5_000_000)
        ->where('plan.on_track', false));
    expect(FundingSource::count())->toBe(1);
});

it('does not touch other workspaces when deleting a category', function () {
    [$user, , $category] = budgetSetup();
    [, $other] = workspace();
    app(TemplateApplier::class)->apply($other);
    $before = BudgetItem::withoutGlobalScopes()->where('wedding_id', $other->id)->count();

    $this->actingAs($user)->delete("/anggaran/kategori/{$category->id}")->assertRedirect();

    expect(BudgetItem::withoutGlobalScopes()->where('wedding_id', $other->id)->count())->toBe($before)->and(Wedding::count())->toBe(2);
    expect(Payment::count())->toBe(0);
});
