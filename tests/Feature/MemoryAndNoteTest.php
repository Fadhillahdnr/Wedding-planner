<?php

use App\Enums\MemberRole;
use App\Models\LoveNote;
use App\Models\Memory;
use App\Models\User;
use App\Models\WeddingMember;

/** Menambahkan pasangan kedua ke workspace yang sama. */
function partnerOf($wedding): User
{
    $partner = User::factory()->create();
    WeddingMember::create(['wedding_id' => $wedding->id, 'user_id' => $partner->id, 'role' => MemberRole::Partner]);

    return $partner;
}

it('mengharuskan login untuk kenangan dan catatan', function () {
    $this->get('/kenangan')->assertRedirect('/login');
    $this->get('/catatan')->assertRedirect('/login');
});

it('membuat, mengubah, dan menghapus kenangan', function () {
    [$user] = workspace();

    $this->actingAs($user)->post('/kenangan', ['title' => 'Pertama bertemu', 'happened_on' => '2020-01-02'])->assertSessionHasNoErrors();
    $memory = Memory::firstOrFail();
    expect($memory->title)->toBe('Pertama bertemu');

    $this->actingAs($user)->put("/kenangan/{$memory->id}", ['title' => 'Ubah'])->assertSessionHasNoErrors();
    expect($memory->fresh()->title)->toBe('Ubah');

    $this->actingAs($user)->delete("/kenangan/{$memory->id}");
    expect(Memory::count())->toBe(0);
});

it('menolak kenangan tanpa judul atau bertanggal di masa depan', function () {
    [$user] = workspace();

    $this->actingAs($user)->post('/kenangan', ['title' => ''])->assertSessionHasErrors('title');
    $this->actingAs($user)->post('/kenangan', ['title' => 'x', 'happened_on' => now()->addYear()->toDateString()])->assertSessionHasErrors('happened_on');
});

it('tidak membiarkan workspace lain mengubah atau menghapus kenangan (IDOR)', function () {
    [$user] = workspace();
    [, $other] = workspace();
    $foreign = Memory::forceCreate(['wedding_id' => $other->id, 'title' => 'Milik lain']);

    $this->actingAs($user)->put("/kenangan/{$foreign->id}", ['title' => 'x'])->assertNotFound();
    $this->actingAs($user)->delete("/kenangan/{$foreign->id}")->assertNotFound();
    expect(Memory::withoutGlobalScopes()->find($foreign->id))->not->toBeNull();
});

it('hanya menampilkan kenangan workspace sendiri', function () {
    [$user, $wedding] = workspace();
    [, $other] = workspace();
    Memory::forceCreate(['wedding_id' => $wedding->id, 'title' => 'Punya kita']);
    Memory::forceCreate(['wedding_id' => $other->id, 'title' => 'Punya orang']);

    $this->actingAs($user)->get('/kenangan')->assertInertia(fn ($page) => $page
        ->component('memories/index')
        ->has('memories.data', 1)
        ->where('memories.data.0.title', 'Punya kita'));
});

it('menyembunyikan catatan terjadwal dari pasangan sebelum tanggal bukanya', function () {
    [$author, $wedding] = workspace();
    $partner = partnerOf($wedding);
    $tomorrow = now($wedding->timezone ?? 'Asia/Jakarta')->addDay()->toDateString();

    $this->actingAs($author)->post('/catatan', ['title' => 'Kejutan', 'body' => 'Isi rahasia', 'visibility' => 'shared', 'reveal_on' => $tomorrow])->assertSessionHasNoErrors();

    $this->actingAs($partner)->get('/catatan')->assertInertia(fn ($page) => $page->has('notes.data', 0));
    $this->actingAs($author)->get('/catatan')->assertInertia(fn ($page) => $page->has('notes.data', 1)->where('notes.data.0.scheduled', true));
});

it('tidak membocorkan catatan terjadwal atau privat lewat dashboard pasangan', function () {
    [$author, $wedding] = workspace();
    $partner = partnerOf($wedding);

    LoveNote::forceCreate(['wedding_id' => $wedding->id, 'author_id' => $author->id, 'title' => 'Privat', 'body' => 'rahasia-privat', 'visibility' => 'private']);
    LoveNote::forceCreate(['wedding_id' => $wedding->id, 'author_id' => $author->id, 'title' => 'Nanti', 'body' => 'rahasia-nanti', 'visibility' => 'shared', 'reveal_on' => now()->addDays(3)->toDateString()]);

    $this->actingAs($partner)->get('/dashboard')->assertInertia(fn ($page) => $page->where('partner_note', null));
    $this->actingAs($partner)->get('/catatan')->assertDontSee('rahasia-privat')->assertDontSee('rahasia-nanti');
});

it('menampilkan catatan bersama yang sudah tanpa tanggal buka atau tanggalnya tiba', function () {
    [$author, $wedding] = workspace();
    $partner = partnerOf($wedding);
    LoveNote::forceCreate(['wedding_id' => $wedding->id, 'author_id' => $author->id, 'title' => 'Halo', 'body' => 'Selamat pagi', 'visibility' => 'shared']);
    LoveNote::forceCreate(['wedding_id' => $wedding->id, 'author_id' => $author->id, 'title' => 'Kemarin', 'body' => 'Sudah terbuka', 'visibility' => 'shared', 'reveal_on' => now()->subDay()->toDateString()]);

    $this->actingAs($partner)->get('/catatan')->assertInertia(fn ($page) => $page->has('notes.data', 2));
    $this->actingAs($partner)->get('/dashboard')->assertInertia(fn ($page) => $page->where('partner_note.author', $author->name));
});

it('hanya penulis yang boleh mengubah atau menghapus catatan', function () {
    [$author, $wedding] = workspace();
    $partner = partnerOf($wedding);
    $note = LoveNote::forceCreate(['wedding_id' => $wedding->id, 'author_id' => $author->id, 'title' => 'A', 'body' => 'B', 'visibility' => 'shared']);

    $this->actingAs($partner)->put("/catatan/{$note->id}", ['title' => 'x', 'body' => 'y', 'visibility' => 'shared'])->assertForbidden();
    $this->actingAs($partner)->delete("/catatan/{$note->id}")->assertForbidden();
    $this->actingAs($author)->put("/catatan/{$note->id}", ['title' => 'Baru', 'body' => 'y', 'visibility' => 'private'])->assertSessionHasNoErrors();
    expect($note->fresh()->title)->toBe('Baru');
});

it('menolak visibilitas tak dikenal dan tanggal buka yang sudah lewat', function () {
    [$user] = workspace();

    $this->actingAs($user)->post('/catatan', ['title' => 'a', 'body' => 'b', 'visibility' => 'publik'])->assertSessionHasErrors('visibility');
    $this->actingAs($user)->post('/catatan', ['title' => 'a', 'body' => 'b', 'visibility' => 'shared', 'reveal_on' => now()->subDays(2)->toDateString()])->assertSessionHasErrors('reveal_on');
});

it('mengisolasi catatan antar workspace', function () {
    [$user] = workspace();
    [$otherUser, $other] = workspace();
    $foreign = LoveNote::forceCreate(['wedding_id' => $other->id, 'author_id' => $otherUser->id, 'title' => 'L', 'body' => 'M', 'visibility' => 'shared']);

    $this->actingAs($user)->get('/catatan')->assertInertia(fn ($page) => $page->has('notes.data', 0));
    $this->actingAs($user)->put("/catatan/{$foreign->id}", ['title' => 'x', 'body' => 'y', 'visibility' => 'shared'])->assertNotFound();
});

it('menampilkan landing publik untuk tamu dan mengarahkan pengguna login ke dashboard', function () {
    $this->get('/')->assertOk()->assertInertia(fn ($page) => $page->component('landing'));

    [$user] = workspace();
    $this->actingAs($user)->get('/')->assertRedirect('/dashboard');
});
