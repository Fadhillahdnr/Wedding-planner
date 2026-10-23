<?php

namespace App\Http\Controllers;

use App\Enums\MemberRole;
use App\Http\Requests\WeddingDateRequest;
use App\Http\Requests\WeddingSettingsRequest;
use App\Models\Invitation;
use App\Services\ActivityLogger;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class WeddingSettingsController extends Controller
{
    public function edit(Request $request)
    {
        $wedding = $request->user()->wedding();

        return Inertia::render('settings/wedding', [
            'wedding' => [
                ...$wedding->only(
                    'partner_one_name', 'partner_two_name', 'city', 'timezone', 'guest_estimate', 'total_budget',
                    'contingency_percent', 'price_buffer_percent', 'warning_threshold_percent', 'include_honeymoon', 'include_prewedding',
                ),
                'target_date' => $wedding->target_date?->toDateString(),
                'target_month' => $wedding->target_month?->format('Y-m'),
            ],
            'isOwner' => $request->user()->isOwner(),
            'members' => $wedding->members()->with('user:id,name,email')->get()->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->user->name,
                'email' => $m->user->email,
                'role' => $m->role->value,
            ]),
            'invitations' => Invitation::query()
                ->where('wedding_id', $wedding->id)
                ->whereNull('accepted_at')->whereNull('revoked_at')->where('expires_at', '>', now())
                ->get(['id', 'email', 'expires_at'])
                ->map(fn ($i) => ['id' => $i->id, 'email' => $i->email, 'expires_at' => $i->expires_at->toDateString()]),
            // Tautan undangan hanya ditampilkan sekali, tepat setelah dibuat.
            'inviteLink' => session('invite_link'),
        ]);
    }

    public function update(WeddingSettingsRequest $request, ActivityLogger $log)
    {
        $wedding = $request->user()->wedding();
        $data = $request->validated();

        if (($data['total_budget'] ?? null) !== $wedding->total_budget) {
            $log->record('wedding.total_budget_changed');
        }

        $wedding->update($data);

        return back()->with('success', 'Pengaturan disimpan.');
    }

    /** Pratinjau perubahan tenggat sebelum hari H diubah (tidak menyimpan apa pun). */
    public function previewDate(WeddingDateRequest $request, ScheduleService $schedule)
    {
        $wedding = $request->user()->wedding();
        $reference = $this->reference($request->validated());
        $today = now($wedding->timezone)->startOfDay();

        return response()->json(['changes' => $schedule->preview($reference, $today)]);
    }

    public function updateDate(WeddingDateRequest $request, ScheduleService $schedule, ActivityLogger $log)
    {
        $wedding = $request->user()->wedding();
        $data = $request->validated();
        $reference = $this->reference($data);
        $today = now($wedding->timezone)->startOfDay();

        $wedding->update([
            'target_date' => $data['target_date'] ?? null,
            'target_month' => isset($data['target_month']) && empty($data['target_date'])
                ? Carbon::createFromFormat('Y-m', $data['target_month'])->startOfMonth()
                : null,
        ]);

        $changed = $schedule->apply($wedding, $reference, $today);
        $log->record('wedding.date_changed', ['tasks_rescheduled' => $changed]);

        return back()->with('success', "Hari H diperbarui; $changed tugas dijadwal ulang.");
    }

    public function invite(Request $request, ActivityLogger $log)
    {
        abort_unless($request->user()->isOwner(), 403);

        $data = $request->validate(['email' => ['required', 'email', 'max:190']]);
        [, $token] = Invitation::issue($request->user()->wedding(), $request->user(), $data['email']);
        $log->record('member.invited');

        return back()->with('invite_link', route('invitation.show', $token));
    }

    public function revoke(Request $request, Invitation $invitation, ActivityLogger $log)
    {
        abort_unless($request->user()->isOwner() && $invitation->wedding_id === $request->user()->weddingId(), 403);

        $invitation->update(['revoked_at' => now()]);
        $log->record('member.invitation_revoked');

        return back()->with('success', 'Undangan dicabut.');
    }

    public function removeMember(Request $request, int $member, ActivityLogger $log)
    {
        abort_unless($request->user()->isOwner(), 403);

        $membership = $request->user()->wedding()->members()->with('user')->findOrFail($member);
        abort_if($membership->role === MemberRole::Owner, 422, 'Pemilik tidak dapat dikeluarkan.');

        $membership->user->delete();
        $log->record('member.removed');

        return back()->with('success', 'Anggota dikeluarkan.');
    }

    /** @param  array<string,mixed>  $data */
    private function reference(array $data): Carbon
    {
        return ! empty($data['target_date'])
            ? Carbon::parse($data['target_date'])
            : Carbon::createFromFormat('Y-m', $data['target_month'])->day(15);
    }
}
