<?php

use App\Enums\BookingStatus;
use App\Enums\Role;
use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Validation\ValidationException;

function pkg(): Package
{
    return Package::create(['name' => 'P', 'slug' => 'p', 'is_published' => true]);
}

it('creates a pending booking with history', function () {
    $u = User::factory()->create();
    $this->actingAs($u)->post('/booking', ['package_id' => pkg()->id, 'preferred_date' => now()->addMonth()->toDateString()])
        ->assertRedirect('/booking');

    $b = Booking::first();
    expect($b->status)->toBe(BookingStatus::Pending)->and($b->histories)->toHaveCount(1);
});

it('rejects duplicate active booking for same package and date', function () {
    $u = User::factory()->create();
    $data = ['package_id' => pkg()->id, 'preferred_date' => now()->addMonth()->toDateString()];
    $this->actingAs($u)->post('/booking', $data);
    $this->actingAs($u)->post('/booking', $data)->assertSessionHasErrors('preferred_date');
    expect(Booking::count())->toBe(1);
});

it('validates status transitions', function () {
    $u = User::factory()->create();
    $b = app(BookingService::class)->create($u, ['package_id' => pkg()->id, 'preferred_date' => now()->addMonth()->toDateString()]);
    $svc = app(BookingService::class);

    expect(fn () => $svc->transition($b, BookingStatus::Completed, $u))->toThrow(ValidationException::class);
    $svc->transition($b, BookingStatus::Confirmed, $u);
    $svc->transition($b, BookingStatus::Cancelled, $u);
    expect(fn () => $svc->transition($b, BookingStatus::Confirmed, $u))->toThrow(ValidationException::class);
    expect($b->fresh()->histories)->toHaveCount(3);
});

it('prevents a customer from cancelling another customer booking', function () {
    $a = User::factory()->create();
    $b = app(BookingService::class)->create($a, ['package_id' => pkg()->id, 'preferred_date' => now()->addMonth()->toDateString()]);
    $this->actingAs(User::factory()->create())->patch("/booking/{$b->id}/batal")->assertForbidden();
});

it('only staff can update booking status via admin', function () {
    $c = User::factory()->create();
    $b = app(BookingService::class)->create($c, ['package_id' => pkg()->id, 'preferred_date' => now()->addMonth()->toDateString()]);

    $this->actingAs($c)->patch("/admin/bookings/{$b->id}", ['status' => 'confirmed'])->assertForbidden();
    $staff = User::factory()->role(Role::Staff)->create();
    $this->actingAs($staff)->patch("/admin/bookings/{$b->id}", ['status' => 'confirmed'])->assertRedirect();
    expect($b->fresh()->status)->toBe(BookingStatus::Confirmed);
});
