<?php

use App\Domain\Templates\TemplateApplier;
use App\Models\BudgetCategory;
use App\Models\Task;
use App\Models\VendorSlot;
use App\Models\Wedding;

it('completes onboarding, applies the template and allocates the budget exactly', function () {
    [$user, $wedding] = workspace(['onboarded_at' => null]);

    $this->actingAs($user)->post('/onboarding', [
        'partner_one_name' => 'Alya',
        'partner_two_name' => 'Bima',
        'target_month' => now()->addMonths(24)->format('Y-m'),
        'guest_estimate' => 200,
        'total_budget' => 123_456_789,
        'funding_name' => 'Tabungan bersama',
        'funding_collected' => 10_000_000,
        'funding_monthly' => 3_000_000,
    ])->assertRedirect('/dashboard');

    $wedding->refresh();
    expect($wedding->isOnboarded())->toBeTrue()
        ->and($wedding->target_month->day)->toBe(1)
        ->and(Task::count())->toBeGreaterThan(30)
        ->and(VendorSlot::count())->toBeGreaterThan(10);

    $allocated = BudgetCategory::sum('allocated_amount');
    $contingency = intdiv(123_456_789 * 6 + 50, 100);
    expect($allocated + $contingency)->toBe(123_456_789);
});

it('lets every onboarding field be skipped', function () {
    [$user] = workspace(['onboarded_at' => null]);

    $this->actingAs($user)->post('/onboarding', [])->assertRedirect('/dashboard');

    expect(BudgetCategory::count())->toBeGreaterThan(0)->and(BudgetCategory::sum('allocated_amount'))->toBe(0);
});

it('dates template tasks from the wedding day only when a date is known', function () {
    [$user] = workspace(['onboarded_at' => null]);
    $this->actingAs($user)->post('/onboarding', [])->assertRedirect();
    expect(Task::whereNotNull('due_date')->count())->toBe(0);

    [$user2] = workspace(['onboarded_at' => null]);
    $date = now()->addYears(2)->toDateString();
    $this->actingAs($user2)->post('/onboarding', ['target_date' => $date])->assertRedirect();
    expect(Task::whereNull('due_date')->count())->toBe(0)
        ->and(Task::where('title', 'like', 'Gladi resik')->value('due_date')->toDateString())->toBe(now()->addYears(2)->subWeek()->toDateString());
});

it('does not overwrite user changes when the template is applied again', function () {
    [$user, $wedding] = workspace(['onboarded_at' => null]);
    $this->actingAs($user)->post('/onboarding', ['total_budget' => 100_000_000])->assertRedirect();

    BudgetCategory::where('name', 'Dekorasi')->update(['allocated_amount' => 1, 'name' => 'Dekorasi']);
    Task::where('title', 'Gladi resik')->delete();
    $count = Task::count();

    app(TemplateApplier::class)->apply(Wedding::find($wedding->id));

    expect(BudgetCategory::where('name', 'Dekorasi')->value('allocated_amount'))->toBe(1)
        ->and(Task::count())->toBe($count + 1)
        ->and(BudgetCategory::where('name', 'Dekorasi')->count())->toBe(1);
});

it('rejects a past wedding date', function () {
    [$user] = workspace(['onboarded_at' => null]);

    $this->actingAs($user)->post('/onboarding', ['target_date' => now()->subDay()->toDateString()])->assertSessionHasErrors('target_date');
});
