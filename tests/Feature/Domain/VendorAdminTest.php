<?php

use App\Enums\Role;
use App\Models\MediaAsset;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorCategory;

function vendorPayload(array $over = []): array
{
    return array_merge([
        'vendor_category_id' => VendorCategory::firstOrCreate(['slug' => 'foto'], ['name' => 'Fotografi'])->id,
        'name' => 'Studio Cahaya', 'status' => 'published', 'city' => 'Bandung', 'price_min' => 1000000, 'price_max' => 5000000,
    ], $over);
}

it('blocks non-staff from vendor admin', function () {
    $this->get('/admin/vendors')->assertRedirect('/login');
    $this->actingAs(User::factory()->create())->get('/admin/vendors')->assertForbidden();
    $this->actingAs(User::factory()->create())->post('/admin/vendors', vendorPayload())->assertForbidden();
});

it('creates, updates and deletes a vendor with unique slugs', function () {
    $staff = User::factory()->role(Role::Staff)->create();
    $this->actingAs($staff)->get('/admin/vendors')->assertOk();

    $this->actingAs($staff)->post('/admin/vendors', vendorPayload())->assertRedirect();
    $this->actingAs($staff)->post('/admin/vendors', vendorPayload())->assertRedirect();
    expect(Vendor::pluck('slug')->all())->toBe(['studio-cahaya', 'studio-cahaya-2']);

    $vendor = Vendor::first();
    $this->actingAs($staff)->put("/admin/vendors/{$vendor->id}", vendorPayload(['name' => 'Baru', 'status' => 'draft']))->assertRedirect();
    expect($vendor->fresh()->name)->toBe('Baru')->and($vendor->fresh()->slug)->toBe('studio-cahaya');

    $this->actingAs($staff)->delete("/admin/vendors/{$vendor->id}")->assertRedirect();
    expect(Vendor::count())->toBe(1);
});

it('validates vendor input', function () {
    $staff = User::factory()->role(Role::Staff)->create();
    $this->actingAs($staff)->post('/admin/vendors', vendorPayload(['status' => 'bogus', 'price_max' => 1]))->assertSessionHasErrors(['status', 'price_max']);
    $this->actingAs($staff)->post('/admin/vendors', vendorPayload(['vendor_category_id' => 9999]))->assertSessionHasErrors('vendor_category_id');
});

it('attaches uploaded media to a vendor', function () {
    config(['cloudinary.cloud_name' => 'democloud', 'cloudinary.api_key' => 'k', 'cloudinary.api_secret' => 's', 'cloudinary.root_folder' => 'wp']);
    $staff = User::factory()->role(Role::Staff)->create();
    $vendor = Vendor::create(['vendor_category_id' => vendorPayload()['vendor_category_id'], 'name' => 'V', 'slug' => 'v']);

    $this->actingAs($staff)->postJson('/media', [
        'collection' => 'vendors', 'resource_type' => 'image', 'vendor_id' => $vendor->id, 'public_id' => 'wp/vendors/a', 'format' => 'jpg', 'bytes' => 1000,
        'secure_url' => 'https://res.cloudinary.com/democloud/image/upload/wp/vendors/a.jpg',
    ])->assertCreated();

    expect(MediaAsset::first()->mediable_id)->toBe($vendor->id)->and($vendor->media()->count())->toBe(1);
});
