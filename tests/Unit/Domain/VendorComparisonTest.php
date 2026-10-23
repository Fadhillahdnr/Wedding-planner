<?php

use App\Domain\Vendors\SlotStatusResolver;
use App\Domain\Vendors\VendorComparison;
use Illuminate\Support\Carbon;

it('weights only the criteria that were scored', function () {
    $c = new VendorComparison;

    expect($c->weightedScore([1 => 5, 2 => 3], [1 => 2, 2 => 1, 3 => 5]))->toBe(4.3)
        ->and($c->weightedScore([], [1 => 1]))->toBeNull()
        ->and($c->weightedScore([9 => 4], [1 => 1]))->toBeNull();
});

it('reports the difference from the estimate', function () {
    $c = new VendorComparison;

    expect($c->differenceFromEstimate(12_000_000, 10_000_000))->toBe(2_000_000)
        ->and($c->differenceFromEstimate(8_000_000, 10_000_000))->toBe(-2_000_000)
        ->and($c->differenceFromEstimate(null, 10_000_000))->toBeNull()
        ->and($c->differenceFromEstimate(5, 0))->toBeNull();
});

it('derives the slot status from candidates and payments', function (array $statuses, array $meetings, int $agreed, int $paid, string $expected) {
    $status = (new SlotStatusResolver)->resolve($statuses, $meetings, $agreed, $paid, Carbon::parse('2026-10-24'));

    expect($status)->toBe($expected);
})->with([
    'no candidates' => [[], [], 0, 0, 'belum_dicari'],
    'only rejected' => [['ditolak'], [], 0, 0, 'belum_dicari'],
    'contacted' => [['dihubungi'], [], 0, 0, 'riset'],
    'shortlisted' => [['shortlist', 'ditolak'], [], 0, 0, 'shortlist'],
    'scheduled survey' => [['shortlist'], ['2026-11-01'], 0, 0, 'survei_terjadwal'],
    'past meeting is not scheduled' => [['survei'], ['2026-10-01'], 0, 0, 'sudah_survei'],
    'negotiating wins' => [['survei', 'negosiasi'], ['2026-11-01'], 0, 0, 'negosiasi'],
    'chosen' => [['terpilih', 'ditolak'], [], 10_000_000, 0, 'terpilih'],
    'deposit paid' => [['terpilih'], [], 10_000_000, 3_000_000, 'dp_dibayar'],
    'settled' => [['terpilih'], [], 10_000_000, 10_000_000, 'lunas'],
    'chosen without agreed price is never settled' => [['terpilih'], [], 0, 0, 'terpilih'],
]);
