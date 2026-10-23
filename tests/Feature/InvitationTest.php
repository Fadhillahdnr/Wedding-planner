<?php

use App\Enums\MemberRole;
use App\Models\Invitation;
use App\Models\User;

function inviteLinkFor($test, User $owner, string $email = 'pasangan@example.test'): string
{
    $test->actingAs($owner)->post('/pengaturan/undangan', ['email' => $email])->assertRedirect();

    return session('invite_link');
}

it('lets only the owner create an invitation and stores just the token hash', function () {
    [$owner, $wedding] = workspace();
    $link = inviteLinkFor($this, $owner);
    $token = basename($link);

    $invitation = Invitation::first();
    expect($invitation->token_hash)->toBe(hash('sha256', $token))->and($invitation->token_hash)->not->toContain($token)
        ->and($invitation->expires_at->isBetween(now()->addDays(6), now()->addDays(8)))->toBeTrue();

    [$partner] = workspace([], MemberRole::Partner);
    $this->actingAs($partner)->post('/pengaturan/undangan', ['email' => 'x@example.test'])->assertForbidden();
    expect($wedding->id)->toBeInt();
});

it('lets the partner set their own password and join the same workspace', function () {
    [$owner, $wedding] = workspace(['partner_one_name' => 'Alya']);
    $token = basename(inviteLinkFor($this, $owner));
    auth()->logout();

    $this->get("/undangan/{$token}")->assertOk();
    $this->post("/undangan/{$token}", ['name' => 'Bima', 'password' => 'kata-sandi-panjang-1', 'password_confirmation' => 'kata-sandi-panjang-1'])->assertRedirect('/dashboard');

    $partner = User::where('email', 'pasangan@example.test')->first();
    expect($partner->weddingId())->toBe($wedding->id)->and($partner->membership->role)->toBe(MemberRole::Partner)
        ->and(auth()->id())->toBe($partner->id);
});

it('rejects reused, expired and revoked links', function () {
    [$owner] = workspace();
    $token = basename(inviteLinkFor($this, $owner));
    auth()->logout();

    $this->post("/undangan/{$token}", ['name' => 'Bima', 'password' => 'kata-sandi-panjang-1', 'password_confirmation' => 'kata-sandi-panjang-1'])->assertRedirect();
    auth()->logout();
    $this->get("/undangan/{$token}")->assertNotFound();

    [$owner2] = workspace();
    $expired = basename(inviteLinkFor($this, $owner2, 'lain@example.test'));
    Invitation::where('email', 'lain@example.test')->update(['expires_at' => now()->subMinute()]);
    auth()->logout();
    $this->get("/undangan/{$expired}")->assertNotFound();

    [$owner3] = workspace();
    $revoked = basename(inviteLinkFor($this, $owner3, 'cabut@example.test'));
    $this->delete('/pengaturan/undangan/'.Invitation::where('email', 'cabut@example.test')->value('id'))->assertRedirect();
    auth()->logout();
    $this->get("/undangan/{$revoked}")->assertNotFound();
});

it('enforces a strong password and an existing-email guard', function () {
    [$owner] = workspace();
    $token = basename(inviteLinkFor($this, $owner));
    auth()->logout();

    $this->post("/undangan/{$token}", ['name' => 'B', 'password' => 'pendek', 'password_confirmation' => 'pendek'])->assertSessionHasErrors('password');

    User::factory()->create(['email' => 'pasangan@example.test']);
    $this->post("/undangan/{$token}", ['name' => 'B', 'password' => 'kata-sandi-panjang-1', 'password_confirmation' => 'kata-sandi-panjang-1'])->assertStatus(422);
});

it('does not let a partner remove the owner or manage members', function () {
    [$owner, $wedding] = workspace();
    [$partner] = workspace([], MemberRole::Partner);
    $ownerMember = $wedding->members()->first();

    $this->actingAs($partner)->delete("/pengaturan/anggota/{$ownerMember->id}")->assertForbidden();

    $this->actingAs($owner)->delete("/pengaturan/anggota/{$ownerMember->id}")->assertStatus(422);
    expect(User::find($owner->id))->not->toBeNull();
});

it('removes a partner account but keeps the workspace', function () {
    [$owner, $wedding] = workspace();
    $partner = User::factory()->create();
    $member = $wedding->members()->create(['user_id' => $partner->id, 'role' => MemberRole::Partner]);

    $this->actingAs($owner)->delete("/pengaturan/anggota/{$member->id}")->assertRedirect();

    expect(User::find($partner->id))->toBeNull()->and($wedding->fresh())->not->toBeNull();
});

it('creates an owner with a workspace from the artisan command', function () {
    $this->artisan('app:create-owner', ['--name' => 'Alya', '--email' => 'alya@example.test', '--password' => 'kata-sandi-panjang-1'])->assertSuccessful();

    $user = User::where('email', 'alya@example.test')->first();
    expect($user->isOwner())->toBeTrue()->and($user->wedding()->isOnboarded())->toBeFalse();

    $this->artisan('app:create-owner', ['--name' => 'Dup', '--email' => 'alya@example.test', '--password' => 'kata-sandi-panjang-1'])->assertFailed();
    $this->artisan('app:create-owner', ['--name' => 'Pendek', '--email' => 'p@example.test', '--password' => 'pendek'])->assertFailed();
});
