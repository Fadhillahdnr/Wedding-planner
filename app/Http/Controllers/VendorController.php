<?php

namespace App\Http\Controllers;

use App\Domain\Budget\BudgetCalculator;
use App\Domain\Vendors\SlotStatusResolver;
use App\Domain\Vendors\VendorComparison;
use App\Enums\CandidateStatus;
use App\Enums\VendorNeed;
use App\Http\Requests\VendorCandidateRequest;
use App\Models\ScoreCriterion;
use App\Models\VendorCandidate;
use App\Models\VendorMeeting;
use App\Models\VendorSlot;
use App\Services\ActivityLogger;
use App\Services\VendorSelection;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index(Request $request, SlotStatusResolver $resolver)
    {
        $wedding = $request->user()->wedding();
        $today = now($wedding->timezone)->startOfDay();

        $slots = VendorSlot::query()
            ->with(['candidates.meetings', 'budgetItem' => fn ($q) => $q->withSum(['payments as paid' => fn ($p) => $p->where('status', 'lunas')], 'amount')])
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('vendors/index', [
            'slots' => $slots->map(fn (VendorSlot $slot) => [
                'id' => $slot->id,
                'name' => $slot->name,
                'need' => $slot->need->value,
                'ideal_months_before' => $slot->ideal_months_before,
                'candidate_count' => $slot->candidates->where('status', '!=', CandidateStatus::Rejected)->count(),
                'chosen' => $slot->candidates->firstWhere('status', CandidateStatus::Chosen)?->only('id', 'name', 'quoted_price'),
                'status' => $resolver->resolve(
                    $slot->candidates->map(fn ($c) => $c->status->value)->all(),
                    $slot->candidates->flatMap(fn ($c) => $c->meetings->map(fn ($m) => $m->met_on->toDateString()))->all(),
                    (int) ($slot->budgetItem?->agreed_amount ?? 0),
                    (int) ($slot->budgetItem?->paid ?? 0),
                    $today,
                ),
            ]),
            'statusLabels' => SlotStatusResolver::LABELS,
        ]);
    }

    public function storeSlot(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'need' => ['required', Rule::enum(VendorNeed::class)],
        ]);

        VendorSlot::create($data + ['sort_order' => (int) VendorSlot::query()->max('sort_order') + 1]);

        return back()->with('success', 'Slot vendor ditambahkan.');
    }

    public function updateSlot(Request $request, VendorSlot $slot)
    {
        $slot->update($request->validate([
            'name' => ['required', 'string', 'max:150'],
            'need' => ['required', Rule::enum(VendorNeed::class)],
        ]));

        return back()->with('success', 'Slot diperbarui.');
    }

    public function destroySlot(VendorSlot $slot, ActivityLogger $log)
    {
        $log->record('vendor.slot.deleted', ['name' => $slot->name, 'candidates' => $slot->candidates()->count()]);
        $slot->delete();

        return to_route('vendors.index')->with('success', 'Slot dihapus.');
    }

    public function show(Request $request, VendorSlot $slot, VendorComparison $comparison, BudgetCalculator $calculator)
    {
        $wedding = $request->user()->wedding();
        $criteria = ScoreCriterion::query()->orderBy('sort_order')->get(['id', 'name', 'weight']);
        $weights = $criteria->pluck('weight', 'id')->all();
        $slot->load(['candidates.scores', 'candidates.meetings', 'budgetItem:id,name,estimate_min,estimate_max,agreed_amount,pricing_mode,price_per_guest']);

        $item = $slot->budgetItem;
        $estimate = $item ? $calculator->estimate([
            'pricing_mode' => $item->pricing_mode->value,
            'estimate_min' => $item->estimate_min,
            'estimate_max' => $item->estimate_max,
            'price_per_guest' => $item->price_per_guest,
            'agreed_amount' => null,
        ], $wedding->guest_estimate)['mid'] : null;

        return Inertia::render('vendors/show', [
            'slot' => [
                'id' => $slot->id,
                'name' => $slot->name,
                'need' => $slot->need->value,
                'estimate' => $slot->budgetItem ? [
                    'min' => $slot->budgetItem->estimate_min,
                    'max' => $slot->budgetItem->estimate_max,
                    'agreed' => $slot->budgetItem->agreed_amount,
                    'per_guest' => $slot->budgetItem->pricing_mode->value === 'per_guest',
                    'price_per_guest' => $slot->budgetItem->price_per_guest,
                    'mid' => $estimate,
                ] : null,
            ],
            'guests' => $wedding->guest_estimate,
            'criteria' => $criteria,
            'candidates' => $slot->candidates->map(fn (VendorCandidate $c) => [
                ...$c->only(
                    'id', 'name', 'city', 'phone', 'instagram', 'website', 'package_name', 'quoted_price', 'inclusions',
                    'exclusions', 'pros', 'cons', 'source', 'notes',
                ),
                'status' => $c->status->value,
                'quoted_on' => $c->quoted_on?->toDateString(),
                'quote_valid_until' => $c->quote_valid_until?->toDateString(),
                'scores' => $c->scores->pluck('score', 'score_criterion_id'),
                'weighted_score' => $comparison->weightedScore($c->scores->pluck('score', 'score_criterion_id')->all(), $weights),
                'estimate_difference' => $comparison->differenceFromEstimate($c->quoted_price, $estimate),
                'meetings' => $c->meetings->map(fn ($m) => [
                    'id' => $m->id,
                    'met_on' => $m->met_on->toDateString(),
                    'notes' => $m->notes,
                    'follow_up' => $m->follow_up,
                ]),
            ]),
        ]);
    }

    public function storeCandidate(VendorCandidateRequest $request, VendorSlot $slot)
    {
        $data = $request->validated();
        $candidate = $slot->candidates()->create(collect($data)->except('scores')->all());
        $this->syncScores($candidate, $data['scores'] ?? []);

        return back()->with('success', 'Kandidat ditambahkan.');
    }

    public function updateCandidate(VendorCandidateRequest $request, VendorCandidate $candidate)
    {
        $data = $request->validated();
        $keepsChosen = $candidate->status === CandidateStatus::Chosen;

        // Kandidat terpilih tidak boleh diturunkan lewat form; gunakan pilihan vendor lain.
        $candidate->update(collect($data)->except('scores')->when($keepsChosen, fn ($c) => $c->except('status'))->all());
        $this->syncScores($candidate, $data['scores'] ?? []);

        return back()->with('success', 'Kandidat diperbarui.');
    }

    public function destroyCandidate(VendorCandidate $candidate, ActivityLogger $log)
    {
        $log->record('vendor.candidate.deleted', ['name' => $candidate->name]);
        $candidate->delete();

        return back()->with('success', 'Kandidat dihapus.');
    }

    public function choose(Request $request, VendorCandidate $candidate, VendorSelection $selection)
    {
        $selection->choose($candidate, $request->boolean('apply_price'));

        return back()->with('success', 'Vendor dipilih.');
    }

    public function storeMeeting(Request $request, VendorCandidate $candidate)
    {
        $data = $request->validate([
            'met_on' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:3000'],
            'follow_up' => ['nullable', 'string', 'max:1000'],
        ]);

        $candidate->meetings()->create($data);

        return back()->with('success', 'Catatan pertemuan disimpan.');
    }

    public function destroyMeeting(VendorMeeting $meeting)
    {
        $meeting->delete();

        return back()->with('success', 'Catatan pertemuan dihapus.');
    }

    /** @param  array<int|string,mixed>  $scores  criterion id => nilai 1–5 */
    private function syncScores(VendorCandidate $candidate, array $scores): void
    {
        $valid = ScoreCriterion::query()->whereIn('id', array_keys($scores))->pluck('id');

        foreach ($valid as $criterionId) {
            $value = $scores[$criterionId] ?? null;

            if ($value === null || $value === '') {
                $candidate->scores()->where('score_criterion_id', $criterionId)->delete();

                continue;
            }

            $candidate->scores()->updateOrCreate(['score_criterion_id' => $criterionId], ['score' => (int) $value]);
        }
    }
}
