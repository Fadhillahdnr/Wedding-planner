<?php

namespace App\Domain\Timeline;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use InvalidArgumentException;

class TimelineScheduler
{
    /** Offset positif = sebelum hari H, negatif = sesudahnya. Bulan dihitung kalender tanpa overflow. */
    public function dueDate(CarbonInterface $weddingDate, int $value, string $unit): CarbonImmutable
    {
        $date = CarbonImmutable::parse($weddingDate->toDateString());

        return match ($unit) {
            'months' => $date->subMonthsNoOverflow($value),
            'weeks' => $date->subWeeks($value),
            'days' => $date->subDays($value),
            default => throw new InvalidArgumentException("Satuan offset tidak dikenal: $unit"),
        };
    }

    /**
     * Pratinjau perubahan tenggat saat hari H berubah. Hanya tugas terbuka, tidak dikunci,
     * dan berbasis template (punya offset) yang dihitung ulang.
     *
     * @param  list<array{id:int,status:string,date_locked:bool,offset_value:?int,offset_unit:?string,due_date:?string}>  $tasks
     * @return list<array{id:int,from:?string,to:?string,ideal:string,needs_reschedule:bool}>
     */
    public function preview(array $tasks, CarbonInterface $newWeddingDate, CarbonInterface $today): array
    {
        $changes = [];

        foreach ($tasks as $task) {
            $open = in_array($task['status'], ['belum', 'dikerjakan'], true);

            if (! $open || $task['date_locked'] || $task['offset_value'] === null || $task['offset_unit'] === null) {
                continue;
            }

            $due = $this->dueDate($newWeddingDate, $task['offset_value'], $task['offset_unit']);
            $pastDue = $due->lessThan($today->copy()->startOfDay());

            $ideal = $due->toDateString();

            if ($ideal === $task['due_date'] && ! $pastDue) {
                continue;
            }

            // Tenggat yang jatuh di masa lalu tidak dipindah diam-diam: tenggat lama dipertahankan
            // ('to' null) dan tugas hanya ditandai perlu dijadwal ulang.
            $changes[] = [
                'id' => $task['id'],
                'from' => $task['due_date'],
                'to' => $pastDue ? null : $ideal,
                'ideal' => $ideal,
                'needs_reschedule' => $pastDue,
            ];
        }

        return $changes;
    }
}
