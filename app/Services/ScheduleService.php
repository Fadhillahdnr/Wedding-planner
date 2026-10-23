<?php

namespace App\Services;

use App\Domain\Timeline\TimelineScheduler;
use App\Models\Task;
use App\Models\Wedding;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/** Menghitung ulang tenggat tugas saat hari H berubah (pratinjau dulu, terapkan setelah konfirmasi). */
class ScheduleService
{
    public function __construct(private readonly TimelineScheduler $scheduler) {}

    /** @return list<array<string,mixed>> */
    public function preview(CarbonInterface $newReference, CarbonInterface $today): array
    {
        $tasks = Task::query()->get()->map(fn (Task $task) => [
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status->value,
            'date_locked' => $task->date_locked,
            'offset_value' => $task->offset_value,
            'offset_unit' => $task->offset_unit,
            'due_date' => $task->due_date?->toDateString(),
        ]);

        $titles = $tasks->pluck('title', 'id');

        return array_map(
            fn (array $change) => $change + ['title' => $titles[$change['id']]],
            $this->scheduler->preview($tasks->all(), $newReference, $today),
        );
    }

    public function apply(Wedding $wedding, CarbonInterface $newReference, CarbonInterface $today): int
    {
        return DB::transaction(function () use ($newReference, $today) {
            $changes = $this->preview($newReference, $today);

            foreach ($changes as $change) {
                $update = ['needs_reschedule' => $change['needs_reschedule']];

                if ($change['to'] !== null) {
                    $update['due_date'] = $change['to'];
                }

                Task::query()->whereKey($change['id'])->update($update);
            }

            return count($changes);
        });
    }
}
