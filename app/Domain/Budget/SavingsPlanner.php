<?php

namespace App\Domain\Budget;

use Carbon\CarbonInterface;

class SavingsPlanner
{
    /**
     * @return array{
     *     need:int, months_left:?int, event_passed:bool, required_per_month:?int,
     *     planned_per_month:int, on_track:bool, shortfall_per_month:int, meet_months:?int, meet_date:?CarbonInterface, meets_before_event:?bool
     * }
     */
    public function plan(
        int $projectedTotal,
        int $collected,
        int $plannedPerMonth,
        ?CarbonInterface $eventDate,
        CarbonInterface $today,
    ): array {
        $need = max(0, $projectedTotal - $collected);
        $eventPassed = $eventDate !== null && $eventDate->startOfDay()->lessThanOrEqualTo($today->copy()->startOfDay());

        // Tanpa tanggal acuan tidak ada pembagian per bulan; hari H yang sudah lewat menampilkan sisa total.
        $monthsLeft = null;
        $required = null;

        if ($eventDate !== null && ! $eventPassed) {
            $monthsLeft = max(1, (int) floor($today->copy()->startOfDay()->diffInMonths($eventDate->copy()->startOfDay())));
            $required = (int) ceil($need / $monthsLeft);
        } elseif ($eventPassed) {
            $required = $need;
        }

        $meetMonths = null;
        $meetDate = null;
        $meetsBefore = null;

        if ($need === 0) {
            $meetMonths = 0;
            $meetDate = $today->copy();
            $meetsBefore = true;
        } elseif ($plannedPerMonth > 0) {
            $meetMonths = (int) ceil($need / $plannedPerMonth);
            $meetDate = $today->copy()->addMonthsNoOverflow($meetMonths);
            $meetsBefore = $eventDate === null ? null : $meetDate->lessThanOrEqualTo($eventDate);
        }

        return [
            'need' => $need,
            'months_left' => $monthsLeft,
            'event_passed' => $eventPassed,
            'required_per_month' => $required,
            'planned_per_month' => $plannedPerMonth,
            'on_track' => $required === null ? $need === 0 : $plannedPerMonth >= $required,
            'shortfall_per_month' => $required === null ? 0 : max(0, $required - $plannedPerMonth),
            'meet_months' => $meetMonths,
            'meet_date' => $meetDate,
            'meets_before_event' => $meetsBefore,
        ];
    }
}
