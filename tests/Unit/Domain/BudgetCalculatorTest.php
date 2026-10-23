<?php

use App\Domain\Budget\BudgetCalculator;
use App\Enums\BudgetStatus;

function budgetItem(int $id, array $over = []): array
{
    return array_merge([
        'id' => $id,
        'pricing_mode' => 'fixed',
        'estimate_min' => null,
        'estimate_max' => null,
        'price_per_guest' => null,
        'agreed_amount' => null,
        'paid' => 0,
    ], $over);
}

beforeEach(function () {
    $this->calc = new BudgetCalculator;
});

it('projects the agreed amount when present, otherwise the estimate midpoint', function () {
    $summary = $this->calc->summarize([
        budgetItem(1, ['estimate_min' => 10_000_000, 'estimate_max' => 20_000_000]),
        budgetItem(2, ['estimate_min' => 5_000_000, 'agreed_amount' => 4_000_000]),
    ], null, null);

    expect($summary['items'][1]['projected'])->toBe(15_000_000)
        ->and($summary['items'][2]['projected'])->toBe(4_000_000)
        ->and($summary['subtotal'])->toBe(19_000_000)
        ->and($summary['projected_range'])->toBe(['min' => 14_000_000, 'max' => 24_000_000]);
});

it('uses whichever bound exists and tolerates a reversed range', function () {
    expect($this->calc->estimate(budgetItem(1, ['estimate_max' => 8_000_000]), null)['mid'])->toBe(8_000_000)
        ->and($this->calc->estimate(budgetItem(1, ['estimate_min' => 9_000_000, 'estimate_max' => 3_000_000]), null))
        ->toBe(['min' => 3_000_000, 'max' => 9_000_000, 'mid' => 6_000_000])
        ->and($this->calc->estimate(budgetItem(1), null)['mid'])->toBe(0);
});

it('recomputes per-guest items when the guest estimate changes', function () {
    $item = budgetItem(1, ['pricing_mode' => 'per_guest', 'price_per_guest' => 150_000]);

    expect($this->calc->summarize([$item], 200, null)['subtotal'])->toBe(30_000_000)
        ->and($this->calc->summarize([$item], 250, null)['subtotal'])->toBe(37_500_000)
        ->and($this->calc->summarize([$item], null, null)['subtotal'])->toBe(0);
});

it('adds contingency as a percent of the subtotal', function () {
    $summary = $this->calc->summarize([budgetItem(1, ['estimate_min' => 100_000_000])], null, null, contingencyPercent: 6);

    expect($summary['contingency'])->toBe(6_000_000)->and($summary['projected_total'])->toBe(106_000_000);
});

it('applies the price buffer only to items that are not agreed yet', function () {
    $summary = $this->calc->summarize([
        budgetItem(1, ['estimate_min' => 10_000_000]),
        budgetItem(2, ['estimate_min' => 10_000_000, 'agreed_amount' => 10_000_000]),
    ], null, null, priceBufferPercent: 10);

    expect($summary['items'][1]['projected'])->toBe(11_000_000)->and($summary['items'][2]['projected'])->toBe(10_000_000);
});

it('tracks paid, remaining and flags overpayment', function () {
    $summary = $this->calc->summarize([
        budgetItem(1, ['agreed_amount' => 10_000_000, 'paid' => 4_000_000]),
        budgetItem(2, ['agreed_amount' => 2_000_000, 'paid' => 2_500_000]),
        budgetItem(3, ['estimate_min' => 1_000_000, 'paid' => 300_000]),
    ], null, null);

    expect($summary['agreed_total'])->toBe(12_000_000)
        ->and($summary['paid_total'])->toBe(6_800_000)
        ->and($summary['remaining_to_pay'])->toBe(6_000_000)
        ->and($summary['overpaid_items'])->toBe([2]);
});

it('derives the budget status including the unset and zero cases', function () {
    expect($this->calc->status(50, null))->toBe(BudgetStatus::Unknown)
        ->and($this->calc->status(0, 0))->toBe(BudgetStatus::Unknown)
        ->and($this->calc->status(0, 100))->toBe(BudgetStatus::Safe)
        ->and($this->calc->status(89, 100))->toBe(BudgetStatus::Safe)
        ->and($this->calc->status(90, 100))->toBe(BudgetStatus::Near)
        ->and($this->calc->status(100, 100))->toBe(BudgetStatus::Near)
        ->and($this->calc->status(101, 100))->toBe(BudgetStatus::Over)
        ->and($this->calc->status(80, 100, 75))->toBe(BudgetStatus::Near);
});

it('reports the variance against the total budget', function () {
    $summary = $this->calc->summarize([budgetItem(1, ['estimate_min' => 120_000_000])], null, 100_000_000);

    expect($summary['variance'])->toBe(-20_000_000)->and($summary['status'])->toBe(BudgetStatus::Over);
});

it('handles an empty budget without dividing or erroring', function () {
    $summary = $this->calc->summarize([], null, null);

    expect($summary['projected_total'])->toBe(0)->and($summary['variance'])->toBeNull();
});
