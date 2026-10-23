<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\BudgetItem;
use App\Models\Event;
use App\Models\Task;
use App\Services\BudgetCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlannerController extends Controller
{
    private function event(Request $request): ?Event
    {
        return $request->user()->events()->first();
    }

    public function dashboard(Request $request, BudgetCalculator $budget)
    {
        $event = $this->event($request);

        return Inertia::render('dashboard', [
            'event' => $event,
            'tasks' => $event?->tasks()->orderBy('is_done')->orderBy('due_date')->get() ?? [],
            'budgetItems' => $event?->budgetItems()->orderBy('category')->get() ?? [],
            'budget' => $event ? $budget->summarize($event) : null,
            'bookingCount' => $request->user()->bookings()->count(),
        ]);
    }

    public function saveEvent(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'partner_name' => ['nullable', 'string', 'max:120'],
            'event_date' => ['nullable', 'date'],
            'venue' => ['nullable', 'string', 'max:150'],
            'guest_estimate' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'budget_total' => ['required', 'numeric', 'min:0', 'max:100000000000'],
        ]);

        $event = $this->event($request);
        $event ? $event->update($data) : $request->user()->events()->create($data);

        return back()->with('success', 'Detail acara disimpan.');
    }

    public function storeTask(Request $request)
    {
        $event = $this->event($request);
        abort_unless($event, 422, 'Buat detail acara terlebih dahulu.');

        $event->tasks()->create($request->validate([
            'title' => ['required', 'string', 'max:190'],
            'due_date' => ['nullable', 'date'],
        ]));

        return back();
    }

    public function toggleTask(Request $request, Task $task)
    {
        abort_unless($task->event->user_id === $request->user()->id, 403);
        $task->update(['is_done' => ! $task->is_done]);

        return back();
    }

    public function destroyTask(Request $request, Task $task)
    {
        abort_unless($task->event->user_id === $request->user()->id, 403);
        $task->delete();

        return back();
    }

    public function storeBudgetItem(Request $request)
    {
        $event = $this->event($request);
        abort_unless($event, 422, 'Buat detail acara terlebih dahulu.');

        $data = $request->validate([
            'category' => ['required', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:150'],
            'estimated' => ['required', 'numeric', 'min:0', 'max:100000000000'],
            'actual' => ['nullable', 'numeric', 'min:0', 'max:100000000000'],
        ]);
        $data['actual'] ??= 0;
        $event->budgetItems()->create($data);

        return back();
    }

    public function destroyBudgetItem(Request $request, BudgetItem $item)
    {
        abort_unless($item->event->user_id === $request->user()->id, 403);
        $item->delete();

        return back();
    }
}
