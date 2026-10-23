<?php

namespace App\Http\Controllers;

use App\Domain\Templates\WeddingTemplates;
use App\Enums\TaskStatus;
use App\Models\Payment;
use App\Models\Task;
use App\Models\VendorSlot;
use App\Services\BudgetOverview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request, BudgetOverview $overview)
    {
        $wedding = $request->user()->wedding();
        $today = now($wedding->timezone)->startOfDay();
        $reference = $wedding->referenceDate();
        $budget = $overview->build($wedding, $today);

        $openTasks = Task::query()->whereIn('status', [TaskStatus::Todo->value, TaskStatus::InProgress->value]);

        $overdue = (clone $openTasks)->whereDate('due_date', '<', $today)->orderBy('due_date')->limit(5)->get(['id', 'title', 'due_date']);
        $thisWeek = (clone $openTasks)->whereBetween('due_date', [$today->toDateString(), $today->copy()->addDays(7)->toDateString()])->orderBy('due_date')->limit(5)->get(['id', 'title', 'due_date']);

        $payments = Payment::query()
            ->with('item:id,name')
            ->whereIn('status', ['direncanakan', 'jatuh_tempo'])
            ->whereDate('due_date', '<=', $today->copy()->addDays(30)->toDateString())
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        // Slot wajib yang waktu idealnya sudah lewat tetapi belum punya vendor terpilih.
        $lateSlots = $reference === null ? collect() : VendorSlot::query()
            ->where('need', 'needed')
            ->whereNotNull('ideal_months_before')
            ->whereDoesntHave('chosen')
            ->get()
            ->filter(fn ($slot) => $reference->copy()->subMonthsNoOverflow($slot->ideal_months_before)->lessThan($today))
            ->values();

        $phaseProgress = Task::query()
            ->whereNotNull('phase')
            ->get(['phase', 'status'])
            ->groupBy('phase')
            ->map(fn ($tasks) => ['done' => $tasks->where('status', TaskStatus::Done)->count(), 'total' => $tasks->count()]);

        return Inertia::render('dashboard', [
            'wedding' => [
                'couple' => $wedding->coupleLabel(),
                'target_date' => $wedding->target_date?->toDateString(),
                'target_month' => $wedding->target_month?->format('Y-m'),
                'estimated' => $wedding->dateIsEstimated(),
                'days_left' => $reference ? (int) $today->diffInDays($reference->startOfDay(), false) : null,
                'guest_estimate' => $wedding->guest_estimate,
            ],
            'budget' => [
                'summary' => collect($budget['summary'])->only([
                    'projected_total', 'agreed_total', 'paid_total', 'remaining_to_pay', 'total_budget', 'variance', 'status_value', 'status_label',
                ]),
                'plan' => $budget['plan'],
                'has_items' => collect($budget['categories'])->sum(fn ($c) => count($c['items'])) > 0,
            ],
            'attention' => [
                'overdue' => $overdue->map(fn ($t) => ['id' => $t->id, 'title' => $t->title, 'due_date' => $t->due_date?->toDateString()]),
                'this_week' => $thisWeek->map(fn ($t) => ['id' => $t->id, 'title' => $t->title, 'due_date' => $t->due_date?->toDateString()]),
                'payments' => $payments->map(fn ($p) => [
                    'id' => $p->id,
                    'label' => $p->label,
                    'item' => $p->item?->name,
                    'amount' => $p->amount,
                    'due_date' => $p->due_date?->toDateString(),
                ]),
                'late_slots' => $lateSlots->map(fn ($s) => ['id' => $s->id, 'name' => $s->name]),
            ],
            'phases' => collect(WeddingTemplates::PHASES)->map(fn ($name, $number) => [
                'number' => $number,
                'name' => $name,
                ...($phaseProgress[$number] ?? ['done' => 0, 'total' => 0]),
            ])->values(),
        ]);
    }
}
