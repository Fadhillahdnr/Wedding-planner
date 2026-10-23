<?php

namespace App\Http\Controllers;

use App\Enums\MemberRole;
use App\Models\Invitation;
use App\Models\User;
use App\Models\WeddingMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

/** Penerimaan undangan pasangan: tautan sekali pakai, berkedaluwarsa; pasangan menetapkan password sendiri. */
class InvitationController extends Controller
{
    public function show(string $token)
    {
        $invitation = Invitation::findUsable($token);
        abort_if($invitation === null, 404);

        return Inertia::render('auth/accept-invitation', ['email' => $invitation->email, 'token' => $token]);
    }

    public function accept(Request $request, string $token)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::min(12)],
        ]);

        $user = DB::transaction(function () use ($token, $data) {
            // Dikunci agar tautan yang sama tidak bisa dipakai dua kali bersamaan.
            $invitation = Invitation::query()->where('token_hash', Invitation::hash($token))->lockForUpdate()->first();
            abort_unless($invitation && Invitation::findUsable($token), 404);
            abort_if(User::where('email', $invitation->email)->exists(), 422, 'Email ini sudah terdaftar.');

            $user = User::create(['name' => $data['name'], 'email' => $invitation->email, 'password' => $data['password']]);
            $user->forceFill(['email_verified_at' => now()])->save();
            WeddingMember::create(['wedding_id' => $invitation->wedding_id, 'user_id' => $user->id, 'role' => MemberRole::Partner]);
            $invitation->update(['accepted_at' => now()]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('dashboard');
    }
}
