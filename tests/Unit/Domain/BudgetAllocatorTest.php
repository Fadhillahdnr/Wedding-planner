<?php

use App\Domain\Budget\BudgetAllocator;

it('always allocates exactly the total, for awkward totals and percents', function (int $total, int $percent) {
    $result = (new BudgetAllocator)->allocate($total, $percent);

    expect(array_sum($result['categories']) + $result['contingency'])->toBe($total);
})->with([
    [100_000_000, 6],
    [123_456_789, 6],
    [1, 6],
    [0, 6],
    [999_999_999, 7],
    [77_777_777, 0],
    [50_000_001, 10],
]);

it('puts the rounding remainder in the largest category', function () {
    $result = (new BudgetAllocator)->allocate(1_000_000_001, 6);
    $plain = (new BudgetAllocator)->allocate(1_000_000_000, 6);

    expect($result['categories']['Venue & katering'] - $plain['categories']['Venue & katering'])->toBeGreaterThan(0);
});

it('matches the documented template shares for a round total', function () {
    $result = (new BudgetAllocator)->allocate(100_000_000, 6);

    expect($result['categories']['Venue & katering'])->toBe(45_000_000)
        ->and($result['categories']['Dekorasi'])->toBe(10_000_000)
        ->and($result['contingency'])->toBe(6_000_000);
});

it('rejects invalid input', function () {
    (new BudgetAllocator)->allocate(-1, 6);
})->throws(InvalidArgumentException::class);
