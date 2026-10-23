<?php

use App\Domain\Templates\TemplateApplier;
use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\Task;
use App\Models\User;
use App\Models\VendorSlot;
use Illuminate\Support\Facades\Auth;

it('has no public registration', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register', ['name' => 'X', 'email' => 'x@x.test', 'password' => 'password-123456', 'password_confirmation' => 'password-123456'])->assertNotFound();
    expect(User::count())->toBe(0);
});

it('sends guests to login and users without a workspace to 403', function () {
    $this->get('/dashboard')->assertRedirect('/login');
    $this->actingAs(User::factory()->create())->get('/dashboard')->assertForbidden();
});

it('redirects a workspace that has not finished onboarding', function () {
    [$user] = workspace(['onboarded_at' => null]);

    $this->actingAs($user)->get('/dashboard')->assertRedirect('/onboarding');
    $this->actingAs($user)->get('/onboarding')->assertOk();
});

it('hides other workspaces data behind 404 for every resource', function () {
    [$mine, $myWedding] = workspace();
    [, $otherWedding] = workspace();
    app(TemplateApplier::class)->apply($otherWedding);

    $category = BudgetCategory::withoutGlobalScopes()->where('wedding_id', $otherWedding->id)->first();
    $item = BudgetItem::withoutGlobalScopes()->where('wedding_id', $otherWedding->id)->first();
    $task = Task::withoutGlobalScopes()->where('wedding_id', $otherWedding->id)->first();
    $slot = VendorSlot::withoutGlobalScopes()->where('wedding_id', $otherWedding->id)->first();

    $this->actingAs($mine);

    $this->put("/anggaran/kategori/{$category->id}", ['name' => 'x', 'allocated_amount' => 1])->assertNotFound();
    $this->delete("/anggaran/kategori/{$category->id}")->assertNotFound();
    $this->put("/anggaran/item/{$item->id}", ['budget_category_id' => $category->id, 'name' => 'x', 'pricing_mode' => 'fixed'])->assertNotFound();
    $this->delete("/anggaran/item/{$item->id}")->assertNotFound();
    $this->put("/timeline/tugas/{$task->id}", ['title' => 'x'])->assertNotFound();
    $this->delete("/timeline/tugas/{$task->id}")->assertNotFound();
    $this->get("/vendor/slot/{$slot->id}")->assertNotFound();
    $this->delete("/vendor/slot/{$slot->id}")->assertNotFound();

    expect(BudgetItem::withoutGlobalScopes()->whereKey($item->id)->exists())->toBeTrue()
        ->and($myWedding->id)->not->toBe($otherWedding->id);
});

it('refuses to attach records to another workspaces parents', function () {
    [$mine] = workspace();
    [, $otherWedding] = workspace();
    app(TemplateApplier::class)->apply($otherWedding);
    $foreignCategory = BudgetCategory::withoutGlobalScopes()->where('wedding_id', $otherWedding->id)->first();
    $foreignSlot = VendorSlot::withoutGlobalScopes()->where('wedding_id', $otherWedding->id)->first();

    $this->actingAs($mine)
        ->post('/anggaran/item', ['budget_category_id' => $foreignCategory->id, 'name' => 'Curang', 'pricing_mode' => 'fixed'])
        ->assertSessionHasErrors('budget_category_id');

    $this->actingAs($mine)
        ->post('/timeline/tugas', ['title' => 'Curang', 'vendor_slot_id' => $foreignSlot->id])
        ->assertSessionHasErrors('vendor_slot_id');

    expect(BudgetItem::withoutGlobalScopes()->where('name', 'Curang')->exists())->toBeFalse();
});

it('shows each member only their own workspace', function () {
    [$a] = workspace(['partner_one_name' => 'Alya']);
    [$b] = workspace(['partner_one_name' => 'Bima']);

    $this->actingAs($a)->get('/dashboard')->assertInertia(fn ($page) => $page->where('wedding.couple', 'Alya'));
    Auth::logout();
    $this->actingAs($b)->get('/dashboard')->assertInertia(fn ($page) => $page->where('wedding.couple', 'Bima'));
});
