<?php

use App\Models\BudgetItem;
use App\Models\Event;
use App\Models\User;
use App\Services\BudgetCalculator;

it('computes budget without floating point drift', function () {
    $event = Event::create(['user_id' => User::factory()->create()->id, 'title' => 'E', 'budget_total' => '1000000.10']);
    BudgetItem::create(['event_id' => $event->id, 'category' => 'a', 'name' => 'x', 'estimated' => '0.10', 'actual' => '0.10']);
    BudgetItem::create(['event_id' => $event->id, 'category' => 'a', 'name' => 'y', 'estimated' => '0.20', 'actual' => '0.20']);

    $s = app(BudgetCalculator::class)->summarize($event);

    expect($s['actual'])->toBe('0.30')->and($s['estimated'])->toBe('0.30')->and($s['over_budget'])->toBeFalse();
    expect($s['remaining'])->toBe('999999.80');
});

it('flags over budget', function () {
    $event = Event::create(['user_id' => User::factory()->create()->id, 'title' => 'E', 'budget_total' => 100]);
    BudgetItem::create(['event_id' => $event->id, 'category' => 'a', 'name' => 'x', 'estimated' => 0, 'actual' => 150]);
    $s = app(BudgetCalculator::class)->summarize($event);
    expect($s['remaining'])->toBe('-50.00')->and($s['over_budget'])->toBeTrue();
});
