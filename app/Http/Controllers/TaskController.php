<?php

namespace App\Http\Controllers;

use App\Domain\Templates\WeddingTemplates;
use App\Enums\TaskStatus;
use App\Http\Requests\TaskRequest;
use App\Models\Task;
use App\Models\VendorSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $wedding = $request->user()->wedding();

        return Inertia::render('timeline/index', [
            'tasks' => Task::query()->with('assignee:id,name')->orderBy('due_date')->orderBy('id')->get()->map(fn (Task $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'description' => $t->description,
                'due_date' => $t->due_date?->toDateString(),
                'status' => $t->status->value,
                'priority' => $t->priority->value,
                'phase' => $t->phase,
                'assignee_id' => $t->assignee_id,
                'assignee' => $t->assignee?->name,
                'vendor_slot_id' => $t->vendor_slot_id,
                'date_locked' => $t->date_locked,
                'needs_reschedule' => $t->needs_reschedule,
                'from_template' => $t->source === 'template',
            ]),
            'phases' => collect(WeddingTemplates::PHASES)->map(fn ($name, $number) => ['number' => $number, 'name' => $name])->values(),
            'members' => $wedding->members()->with('user:id,name')->get()->map(fn ($m) => ['id' => $m->user_id, 'name' => $m->user->name]),
            'slots' => VendorSlot::query()->orderBy('sort_order')->get(['id', 'name']),
            'today' => now($wedding->timezone)->toDateString(),
            'templateLabel' => WeddingTemplates::LABEL,
        ]);
    }

    public function store(TaskRequest $request)
    {
        Task::create($request->validated() + ['source' => 'user']);

        return back()->with('success', 'Tugas ditambahkan.');
    }

    public function update(TaskRequest $request, Task $task)
    {
        $data = $request->validated();

        // Mengubah tenggat secara manual mengunci tanggal agar tidak ikut dihitung ulang saat hari H berubah.
        if (array_key_exists('due_date', $data) && $data['due_date'] !== $task->due_date?->toDateString()) {
            $data['date_locked'] = true;
            $data['needs_reschedule'] = false;
        }

        if (isset($data['status'])) {
            $data['completed_at'] = $data['status'] === TaskStatus::Done->value ? now() : null;
        }

        $task->update($data);

        return back()->with('success', 'Tugas diperbarui.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return back()->with('success', 'Tugas dihapus.');
    }
}
