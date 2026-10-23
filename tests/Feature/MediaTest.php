<?php

use App\Models\MediaAsset;
use App\Models\Memory;
use App\Models\User;
use App\Models\VendorCandidate;
use App\Models\VendorMeeting;
use App\Models\VendorSlot;
use App\Models\Wedding;
use App\Services\Media\MediaStorage;
use Tests\Support\FakeMediaStorage;

beforeEach(function () {
    $this->storage = new FakeMediaStorage;
    app()->instance(MediaStorage::class, $this->storage);
});

/** @return array{0:User,1:Wedding,2:VendorCandidate,3:VendorMeeting} */
function candidateWithMeeting(): array
{
    [$user, $wedding] = workspace();
    $slot = VendorSlot::forceCreate(['wedding_id' => $wedding->id, 'name' => 'Dokumentasi', 'need' => 'needed']);
    $candidate = VendorCandidate::forceCreate(['wedding_id' => $wedding->id, 'vendor_slot_id' => $slot->id, 'name' => 'Studio Contoh', 'status' => 'dihubungi']);
    $meeting = VendorMeeting::forceCreate(['wedding_id' => $wedding->id, 'vendor_candidate_id' => $candidate->id, 'met_on' => now()->toDateString()]);

    return [$user, $wedding, $candidate, $meeting];
}

function requestSignature($test, $user, string $target, int $id)
{
    return $test->actingAs($user)->postJson('/media/tanda-tangan', ['target' => $target, 'target_id' => $id]);
}

it('menentukan folder dan public_id di server dan membuat baris pending', function () {
    [$user, $wedding, , $meeting] = candidateWithMeeting();

    $res = requestSignature($this, $user, 'vendor_meeting', $meeting->id)->assertOk();

    $publicId = $res->json('upload.fields.public_id');
    expect($publicId)->toStartWith("wedding-planner/weddings/{$wedding->id}/vendor_meeting/{$meeting->id}/")
        ->and($res->json('upload.fields.type'))->toBe('authenticated')
        ->and($res->json('upload.fields'))->not->toHaveKey('api_secret');

    $asset = MediaAsset::findOrFail($res->json('asset_id'));
    expect($asset->status)->toBe('pending')->and($asset->public_id)->toBe($publicId);
});

it('menolak target yang bukan milik workspace (IDOR) dan target tidak dikenal', function () {
    [$user] = workspace();
    [, , , $foreignMeeting] = candidateWithMeeting();

    requestSignature($this, $user, 'vendor_meeting', $foreignMeeting->id)->assertNotFound();
    requestSignature($this, $user, 'user', 1)->assertUnprocessable();
    expect(MediaAsset::withoutGlobalScopes()->count())->toBe(0);
});

it('hanya pengguna login yang boleh meminta tanda tangan', function () {
    $this->postJson('/media/tanda-tangan', ['target' => 'vendor_meeting', 'target_id' => 1])->assertUnauthorized();
});

it('mengembalikan 503 bila Cloudinary belum dikonfigurasi', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $this->storage->configured = false;

    requestSignature($this, $user, 'vendor_meeting', $meeting->id)->assertStatus(503);
});

it('mengonfirmasi unggahan yang valid setelah verifikasi ulang', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $res = requestSignature($this, $user, 'vendor_meeting', $meeting->id);
    $this->storage->upload($res->json('upload.fields.public_id'), 'png', 5000);

    $this->actingAs($user)->postJson("/media/{$res->json('asset_id')}/konfirmasi")->assertOk()->assertJson(['kind' => 'photo', 'format' => 'png']);

    expect(MediaAsset::find($res->json('asset_id')))->status->toBe('ready')->bytes->toBe(5000);
});

it('menolak konfirmasi bila berkas tidak benar-benar ada di penyimpanan', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $res = requestSignature($this, $user, 'vendor_meeting', $meeting->id);

    $this->actingAs($user)->postJson("/media/{$res->json('asset_id')}/konfirmasi")->assertUnprocessable();
    expect(MediaAsset::find($res->json('asset_id'))->status)->toBe('pending');
});

it('menolak dan menghapus berkas dengan format tak diizinkan atau terlalu besar', function () {
    [$user, , , $meeting] = candidateWithMeeting();

    $pdf = requestSignature($this, $user, 'vendor_meeting', $meeting->id); // foto saja untuk pertemuan
    $this->storage->upload($pdf->json('upload.fields.public_id'), 'pdf');
    $this->actingAs($user)->postJson("/media/{$pdf->json('asset_id')}/konfirmasi")->assertUnprocessable();

    $big = requestSignature($this, $user, 'vendor_meeting', $meeting->id);
    $this->storage->upload($big->json('upload.fields.public_id'), 'jpg', config('media.max_bytes') + 1);
    $this->actingAs($user)->postJson("/media/{$big->json('asset_id')}/konfirmasi")->assertUnprocessable();

    expect(MediaAsset::count())->toBe(0)->and($this->storage->deleted)->toHaveCount(2);
});

it('mengizinkan PDF untuk dokumen kandidat', function () {
    [$user, , $candidate] = candidateWithMeeting();
    $res = requestSignature($this, $user, 'vendor_candidate', $candidate->id);
    $this->storage->upload($res->json('upload.fields.public_id'), 'pdf');

    $this->actingAs($user)->postJson("/media/{$res->json('asset_id')}/konfirmasi")->assertOk()->assertJson(['kind' => 'document']);
});

it('membatasi jumlah berkas per item', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    config(['media.max_per_item' => 2]);

    requestSignature($this, $user, 'vendor_meeting', $meeting->id)->assertOk();
    requestSignature($this, $user, 'vendor_meeting', $meeting->id)->assertOk();
    requestSignature($this, $user, 'vendor_meeting', $meeting->id)->assertUnprocessable();
});

it('menampilkan aset lewat redirect ke URL bertanda tangan dan 404 untuk workspace lain', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $res = requestSignature($this, $user, 'vendor_meeting', $meeting->id);
    $this->storage->upload($res->json('upload.fields.public_id'));
    $this->actingAs($user)->postJson("/media/{$res->json('asset_id')}/konfirmasi")->assertOk();

    $this->actingAs($user)->get("/media/{$res->json('asset_id')}")->assertRedirectContains('https://res.test/');

    [$other] = workspace();
    $this->actingAs($other)->get("/media/{$res->json('asset_id')}")->assertNotFound();
    $this->actingAs($other)->delete("/media/{$res->json('asset_id')}")->assertNotFound();
});

it('tidak menampilkan aset yang masih pending', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $res = requestSignature($this, $user, 'vendor_meeting', $meeting->id);

    $this->actingAs($user)->get("/media/{$res->json('asset_id')}")->assertNotFound();
});

it('menghapus di penyimpanan dulu dan mempertahankan baris bila penghapusan gagal', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $res = requestSignature($this, $user, 'vendor_meeting', $meeting->id);
    $this->storage->upload($res->json('upload.fields.public_id'));
    $this->actingAs($user)->postJson("/media/{$res->json('asset_id')}/konfirmasi");

    $this->storage->failDelete = true;
    $this->actingAs($user)->deleteJson("/media/{$res->json('asset_id')}")->assertStatus(502);
    expect(MediaAsset::count())->toBe(1);

    $this->storage->failDelete = false;
    $this->actingAs($user)->delete("/media/{$res->json('asset_id')}")->assertRedirect();
    expect(MediaAsset::count())->toBe(0)->and($this->storage->deleted)->toContain($res->json('upload.fields.public_id'));
});

it('menghapus media saat catatan pertemuan dihapus', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $res = requestSignature($this, $user, 'vendor_meeting', $meeting->id);
    $this->storage->upload($res->json('upload.fields.public_id'));
    $this->actingAs($user)->postJson("/media/{$res->json('asset_id')}/konfirmasi");

    $this->actingAs($user)->delete("/vendor/pertemuan/{$meeting->id}")->assertRedirect();

    expect(MediaAsset::count())->toBe(0)->and($this->storage->deleted)->toHaveCount(1);
});

it('media:prune membersihkan unggahan pending lama dan aset yatim', function () {
    [$user, , , $meeting] = candidateWithMeeting();
    $old = requestSignature($this, $user, 'vendor_meeting', $meeting->id);
    $fresh = requestSignature($this, $user, 'vendor_meeting', $meeting->id);
    MediaAsset::withoutGlobalScopes()->whereKey($old->json('asset_id'))->update(['created_at' => now()->subHours(30)]);

    $this->artisan('media:prune')->assertSuccessful();

    expect(MediaAsset::withoutGlobalScopes()->pluck('id')->all())->toBe([$fresh->json('asset_id')]);
});

/** @return array{0:User,1:Wedding,2:Memory} */
function workspaceWithMemory(): array
{
    [$user, $wedding] = workspace();
    $memory = Memory::forceCreate(['wedding_id' => $wedding->id, 'title' => 'Hari pertama']);

    return [$user, $wedding, $memory];
}

function requestVideoSignature($test, $user, string $target, int $id)
{
    return $test->actingAs($user)->postJson('/media/tanda-tangan', ['target' => $target, 'target_id' => $id, 'resource_type' => 'video']);
}

it('menerima video untuk kenangan dan menandatangani ke endpoint video', function () {
    [$user, , $memory] = workspaceWithMemory();

    $res = requestVideoSignature($this, $user, 'memory', $memory->id)->assertOk();

    expect($res->json('upload.url'))->toEndWith('/video')
        ->and($res->json('upload.fields.allowed_formats'))->toBe('mp4,mov,webm')
        ->and(MediaAsset::findOrFail($res->json('asset_id')))->resource_type->toBe('video')->kind->toBe('video');
});

it('menolak video untuk target yang hanya menerima gambar', function () {
    [$user, , , $meeting] = candidateWithMeeting();

    requestVideoSignature($this, $user, 'vendor_meeting', $meeting->id)->assertUnprocessable();
    expect(MediaAsset::count())->toBe(0);
});

it('mengizinkan HEIC untuk gambar dan menolak jenis sumber daya yang tidak dikenal', function () {
    [$user, , $memory] = workspaceWithMemory();

    $res = requestSignature($this, $user, 'memory', $memory->id)->assertOk();
    expect($res->json('upload.fields.allowed_formats'))->toContain('heic');

    $this->actingAs($user)->postJson('/media/tanda-tangan', ['target' => 'memory', 'target_id' => $memory->id, 'resource_type' => 'raw'])->assertUnprocessable();
});

it('mengonfirmasi video dengan batas ukuran video, bukan batas gambar', function () {
    [$user, , $memory] = workspaceWithMemory();
    config(['media.max_bytes' => 1000, 'media.video_max_bytes' => 5000]);

    $ok = requestVideoSignature($this, $user, 'memory', $memory->id);
    $this->storage->upload($ok->json('upload.fields.public_id'), 'mp4', 4000);
    $this->actingAs($user)->postJson("/media/{$ok->json('asset_id')}/konfirmasi")->assertOk()->assertJson(['kind' => 'video', 'format' => 'mp4']);

    $big = requestVideoSignature($this, $user, 'memory', $memory->id);
    $this->storage->upload($big->json('upload.fields.public_id'), 'mp4', 5001);
    $this->actingAs($user)->postJson("/media/{$big->json('asset_id')}/konfirmasi")->assertUnprocessable();

    $photo = requestSignature($this, $user, 'memory', $memory->id);
    $this->storage->upload($photo->json('upload.fields.public_id'), 'jpg', 1001);
    $this->actingAs($user)->postJson("/media/{$photo->json('asset_id')}/konfirmasi")->assertUnprocessable();
});

it('menolak format video yang tidak diizinkan (MOV sah, AVI tidak)', function () {
    [$user, , $memory] = workspaceWithMemory();

    $mov = requestVideoSignature($this, $user, 'memory', $memory->id);
    $this->storage->upload($mov->json('upload.fields.public_id'), 'mov', 2000);
    $this->actingAs($user)->postJson("/media/{$mov->json('asset_id')}/konfirmasi")->assertOk()->assertJson(['kind' => 'video', 'format' => 'mov']);

    $avi = requestVideoSignature($this, $user, 'memory', $memory->id);
    $this->storage->upload($avi->json('upload.fields.public_id'), 'avi', 2000);
    $this->actingAs($user)->postJson("/media/{$avi->json('asset_id')}/konfirmasi")->assertUnprocessable();
});

it('menyajikan sampul hanya untuk video milik workspace', function () {
    [$user, , $memory] = workspaceWithMemory();
    $video = requestVideoSignature($this, $user, 'memory', $memory->id);
    $this->storage->upload($video->json('upload.fields.public_id'), 'mp4', 2000);
    $this->actingAs($user)->postJson("/media/{$video->json('asset_id')}/konfirmasi")->assertOk();
    $photo = requestSignature($this, $user, 'memory', $memory->id);
    $this->storage->upload($photo->json('upload.fields.public_id'), 'jpg', 500);
    $this->actingAs($user)->postJson("/media/{$photo->json('asset_id')}/konfirmasi")->assertOk();

    $this->actingAs($user)->get("/media/{$video->json('asset_id')}/poster")->assertRedirectContains('.jpg');
    $this->actingAs($user)->get("/media/{$photo->json('asset_id')}/poster")->assertNotFound();

    [$other] = workspace();
    $this->actingAs($other)->get("/media/{$video->json('asset_id')}/poster")->assertNotFound();
});
