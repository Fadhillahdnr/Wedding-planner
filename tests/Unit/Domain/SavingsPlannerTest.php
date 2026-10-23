<?php

use App\Domain\Budget\SavingsPlanner;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->planner = new SavingsPlanner;
    $this->today = Carbon::parse('2026-10-24');
});

it('divides the remaining need by the months left', function () {
    $plan = $this->planner->plan(120_000_000, 24_000_000, 3_000_000, Carbon::parse('2028-10-24'), $this->today);

    expect($plan['need'])->toBe(96_000_000)
        ->and($plan['months_left'])->toBe(24)
        ->and($plan['required_per_month'])->toBe(4_000_000)
        ->and($plan['on_track'])->toBeFalse()
        ->and($plan['shortfall_per_month'])->toBe(1_000_000);
});

it('is on track when the planned deposit covers the requirement', function () {
    $plan = $this->planner->plan(120_000_000, 0, 6_000_000, Carbon::parse('2028-10-24'), $this->today);

    expect($plan['on_track'])->toBeTrue()->and($plan['shortfall_per_month'])->toBe(0);
});

it('never lets months left drop below one', function () {
    $plan = $this->planner->plan(10_000_000, 0, 0, Carbon::parse('2026-11-01'), $this->today);

    expect($plan['months_left'])->toBe(1)->and($plan['required_per_month'])->toBe(10_000_000);
});

it('shows the full remainder when the wedding day is today or past', function () {
    $today = $this->planner->plan(10_000_000, 4_000_000, 0, $this->today->copy(), $this->today);
    $past = $this->planner->plan(10_000_000, 4_000_000, 0, Carbon::parse('2026-01-01'), $this->today);

    expect($today['event_passed'])->toBeTrue()->and($today['required_per_month'])->toBe(6_000_000)
        ->and($past['months_left'])->toBeNull()->and($past['required_per_month'])->toBe(6_000_000);
});

it('has no monthly requirement without a reference date', function () {
    $plan = $this->planner->plan(10_000_000, 0, 1_000_000, null, $this->today);

    expect($plan['required_per_month'])->toBeNull()->and($plan['months_left'])->toBeNull()->and($plan['on_track'])->toBeFalse();
});

it('needs nothing when funds already cover the projection', function () {
    $plan = $this->planner->plan(10_000_000, 12_000_000, 0, Carbon::parse('2028-10-24'), $this->today);

    expect($plan['need'])->toBe(0)->and($plan['required_per_month'])->toBe(0)->and($plan['on_track'])->toBeTrue()
        ->and($plan['meet_months'])->toBe(0);
});

it('estimates when funds will be sufficient at the current deposit', function () {
    $plan = $this->planner->plan(100_000_000, 10_000_000, 5_000_000, Carbon::parse('2028-10-24'), $this->today);

    expect($plan['meet_months'])->toBe(18)
        ->and($plan['meet_date']->toDateString())->toBe('2028-04-24')
        ->and($plan['meets_before_event'])->toBeTrue();
});

it('cannot meet the target without any deposit', function () {
    $plan = $this->planner->plan(100_000_000, 0, 0, Carbon::parse('2028-10-24'), $this->today);

    expect($plan['meet_months'])->toBeNull()->and($plan['meet_date'])->toBeNull();
});
