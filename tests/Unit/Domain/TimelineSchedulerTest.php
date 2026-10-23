<?php

use App\Domain\Timeline\TimelineScheduler;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->scheduler = new TimelineScheduler;
    $this->today = Carbon::parse('2026-10-24');
});

function taskRow(int $id, array $over = []): array
{
    return array_merge([
        'id' => $id,
        'status' => 'belum',
        'date_locked' => false,
        'offset_value' => 12,
        'offset_unit' => 'months',
        'due_date' => null,
    ], $over);
}

it('computes due dates relative to the wedding day', function () {
    $day = Carbon::parse('2028-10-24');

    expect($this->scheduler->dueDate($day, 24, 'months')->toDateString())->toBe('2026-10-24')
        ->and($this->scheduler->dueDate($day, 4, 'weeks')->toDateString())->toBe('2028-09-26')
        ->and($this->scheduler->dueDate($day, 10, 'days')->toDateString())->toBe('2028-10-14')
        ->and($this->scheduler->dueDate($day, -1, 'months')->toDateString())->toBe('2028-11-24');
});

it('does not overflow at month ends or on leap days', function () {
    expect($this->scheduler->dueDate(Carbon::parse('2028-03-31'), 1, 'months')->toDateString())->toBe('2028-02-29')
        ->and($this->scheduler->dueDate(Carbon::parse('2027-03-31'), 1, 'months')->toDateString())->toBe('2027-02-28')
        ->and($this->scheduler->dueDate(Carbon::parse('2028-02-29'), 12, 'months')->toDateString())->toBe('2027-02-28');
});

it('rejects an unknown offset unit', function () {
    $this->scheduler->dueDate(Carbon::parse('2028-01-01'), 1, 'years');
})->throws(InvalidArgumentException::class);

it('previews new due dates only for open, unlocked, template tasks', function () {
    $changes = $this->scheduler->preview([
        taskRow(1, ['due_date' => '2027-01-01']),
        taskRow(2, ['status' => 'selesai']),
        taskRow(3, ['date_locked' => true]),
        taskRow(4, ['offset_value' => null, 'offset_unit' => null]),
        taskRow(5, ['status' => 'dilewati']),
        taskRow(6, ['status' => 'dikerjakan']),
    ], Carbon::parse('2028-10-24'), $this->today);

    expect(array_column($changes, 'id'))->toBe([1, 6])
        ->and($changes[0])->toMatchArray(['from' => '2027-01-01', 'to' => '2027-10-24', 'needs_reschedule' => false]);
});

it('skips tasks whose due date would not change', function () {
    $changes = $this->scheduler->preview([taskRow(1, ['due_date' => '2027-10-24'])], Carbon::parse('2028-10-24'), $this->today);

    expect($changes)->toBe([]);
});

it('flags tasks pushed into the past instead of silently moving them', function () {
    $changes = $this->scheduler->preview([taskRow(1, ['offset_value' => 24, 'due_date' => '2027-01-01'])], Carbon::parse('2027-06-01'), $this->today);

    expect($changes[0])->toMatchArray(['to' => null, 'ideal' => '2025-06-01', 'needs_reschedule' => true, 'from' => '2027-01-01']);
});
