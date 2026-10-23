<?php

use App\Domain\Templates\TemplateApplier;
use App\Models\BudgetItem;
use App\Models\ScoreCriterion;
use App\Models\VendorCandidate;
use App\Models\VendorSlot;
use Illuminate\Database\QueryException;

function vendorSetup(): array
{
    [$user, $wedding] = workspace(['guest_estimate' => 100]);
    app(TemplateApplier::class)->apply($wedding);
    $slot = VendorSlot::where('name', 'Dokumentasi (foto & video)')->first();

    return [$user, $wedding, $slot];
}

function candidate(VendorSlot $slot, array $over = []): VendorCandidate
{
    // Dibuat di luar request, jadi workspace dan slot diberikan eksplisit.
    return tap((new VendorCandidate)->forceFill($over + [
        'name' => 'Studio '.uniqid(),
        'status' => 'shortlist',
        'wedding_id' => $slot->wedding_id,
        'vendor_slot_id' => $slot->id,
    ]))->save();
}

it('adds candidates with scores and computes the weighted score on the server', function () {
    [$user, , $slot] = vendorSetup();
    [$priceId, $qualityId] = ScoreCriterion::withoutGlobalScopes()->where('wedding_id', $slot->wedding_id)->orderBy('sort_order')->pluck('id')->all();

    $this->actingAs($user)->post("/vendor/slot/{$slot->id}/kandidat", [
        'name' => 'Studio Cahaya',
        'status' => 'shortlist',
        'quoted_price' => 12_000_000,
        'website' => 'https://cahaya.test',
        'scores' => [$priceId => 5, $qualityId => 3],
    ])->assertRedirect();

    $this->get("/vendor/slot/{$slot->id}")->assertInertia(fn ($page) => $page
        ->where('candidates.0.name', 'Studio Cahaya')
        ->where('candidates.0.weighted_score', 4)
        ->has('criteria', 4));
});

it('rejects unsafe urls and obviously invalid contact fields', function () {
    [$user, , $slot] = vendorSetup();
    $this->actingAs($user);

    $this->post("/vendor/slot/{$slot->id}/kandidat", ['name' => 'X', 'status' => 'shortlist', 'website' => 'javascript:alert(1)'])->assertSessionHasErrors('website');
    $this->post("/vendor/slot/{$slot->id}/kandidat", ['name' => 'X', 'status' => 'shortlist', 'phone' => '<script>'])->assertSessionHasErrors('phone');
    $this->post("/vendor/slot/{$slot->id}/kandidat", ['name' => 'X', 'status' => 'terpilih'])->assertSessionHasErrors('status');
});

it('chooses one candidate per slot and demotes the previous choice', function () {
    [$user, , $slot] = vendorSetup();
    $a = candidate($slot, ['quoted_price' => 8_000_000]);
    $b = candidate($slot, ['quoted_price' => 9_000_000]);
    $this->actingAs($user);

    $this->post("/vendor/kandidat/{$a->id}/pilih")->assertRedirect();
    $this->post("/vendor/kandidat/{$b->id}/pilih")->assertRedirect();

    expect($a->fresh()->status->value)->toBe('negosiasi')->and($b->fresh()->status->value)->toBe('terpilih')
        ->and(VendorCandidate::where('status', 'terpilih')->count())->toBe(1);
});

it('applies the quoted price to the budget only when asked', function () {
    [$user, , $slot] = vendorSetup();
    $a = candidate($slot, ['quoted_price' => 8_000_000]);
    $this->actingAs($user);

    $this->post("/vendor/kandidat/{$a->id}/pilih", ['apply_price' => false])->assertRedirect();
    expect($slot->budgetItem->fresh()->agreed_amount)->toBeNull();

    $this->post("/vendor/kandidat/{$a->id}/pilih", ['apply_price' => true])->assertRedirect();
    expect($slot->budgetItem->fresh()->agreed_amount)->toBe(8_000_000);
});

it('is protected by the database even if application code is bypassed', function () {
    [, , $slot] = vendorSetup();
    candidate($slot, ['status' => 'terpilih']);

    candidate($slot, ['status' => 'terpilih']);
})->throws(QueryException::class);

it('derives slot status from candidates and payments', function () {
    [$user, , $slot] = vendorSetup();
    $this->actingAs($user);
    $status = fn () => collect($this->get('/vendor')->viewData('page')['props']['slots'])->firstWhere('id', $slot->id)['status'];

    expect($status())->toBe('belum_dicari');

    $a = candidate($slot, ['quoted_price' => 10_000_000]);
    expect($status())->toBe('shortlist');

    $this->post("/vendor/kandidat/{$a->id}/pilih", ['apply_price' => true]);
    expect($status())->toBe('terpilih');

    $this->post('/anggaran/pembayaran', ['budget_item_id' => $slot->budget_item_id, 'label' => 'DP', 'amount' => 3_000_000, 'status' => 'lunas', 'paid_on' => '2026-10-01']);
    expect($status())->toBe('dp_dibayar');

    $this->post('/anggaran/pembayaran', ['budget_item_id' => $slot->budget_item_id, 'label' => 'Pelunasan', 'amount' => 7_000_000, 'status' => 'lunas', 'paid_on' => '2026-10-02']);
    expect($status())->toBe('lunas');
});

it('records meetings and refuses another workspaces candidate', function () {
    [$user, , $slot] = vendorSetup();
    $mine = candidate($slot);
    [, $otherWedding] = workspace();
    app(TemplateApplier::class)->apply($otherWedding);
    $foreign = candidate(VendorSlot::withoutGlobalScopes()->where('wedding_id', $otherWedding->id)->first(), ['name' => 'Asing']);

    $this->actingAs($user)->post("/vendor/kandidat/{$mine->id}/pertemuan", ['met_on' => '2026-11-01', 'notes' => 'Bagus', 'follow_up' => 'Minta rincian'])->assertRedirect();
    expect($mine->meetings()->count())->toBe(1);

    $this->post("/vendor/kandidat/{$foreign->id}/pilih")->assertNotFound();
    $this->post("/vendor/kandidat/{$foreign->id}/pertemuan", ['met_on' => '2026-11-01'])->assertNotFound();
    $this->delete("/vendor/kandidat/{$foreign->id}")->assertNotFound();
});

it('keeps the budget item when a slot is deleted', function () {
    [$user, , $slot] = vendorSetup();
    $itemId = $slot->budget_item_id;

    $this->actingAs($user)->delete("/vendor/slot/{$slot->id}")->assertRedirect('/vendor');

    expect(BudgetItem::find($itemId))->not->toBeNull();
});
