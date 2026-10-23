<?php

use App\Enums\Role;
use App\Models\Event;
use App\Models\MediaAsset;
use App\Models\User;
use App\Services\Cloudinary\CloudinaryGateway;

beforeEach(function () {
    config([
        'cloudinary.cloud_name' => 'democloud', 'cloudinary.api_key' => 'k', 'cloudinary.api_secret' => 's', 'cloudinary.root_folder' => 'wp',
    ]);
    $this->gateway = new class implements CloudinaryGateway
    {
        public array $destroyed = [];

        public bool $ok = true;

        public function destroy(string $publicId, string $resourceType, bool $private = false): bool
        {
            $this->destroyed[] = $publicId;

            return $this->ok;
        }

        public function sign(array $params): string
        {
            return 'sig:'.implode(',', array_keys($params));
        }

        public function signedUrl(string $publicId, string $resourceType, ?string $format): string
        {
            return "https://signed.test/$publicId";
        }
    };
    app()->instance(CloudinaryGateway::class, $this->gateway);
});

function uploadPayload(string $folder, array $over = []): array
{
    return array_merge([
        'collection' => 'portfolio', 'resource_type' => 'image', 'public_id' => "$folder/abc", 'format' => 'jpg', 'bytes' => 1000,
        'secure_url' => "https://res.cloudinary.com/democloud/image/upload/$folder/abc.jpg",
    ], $over);
}

it('returns a signature without exposing the api secret', function () {
    $staff = User::factory()->role(Role::Staff)->create();
    $res = $this->actingAs($staff)->postJson('/media/signature', ['collection' => 'portfolio', 'resource_type' => 'image'])->assertOk();
    expect($res->json('folder'))->toBe('wp/portfolio')->and(json_encode($res->json()))->not->toContain('"s"')->not->toContain('api_secret');
});

it('forbids customers from global folders and other customers events', function () {
    $c = User::factory()->create();
    $this->actingAs($c)->postJson('/media/signature', ['collection' => 'portfolio', 'resource_type' => 'image'])->assertStatus(422);
    $other = Event::create(['user_id' => User::factory()->create()->id, 'title' => 'E', 'budget_total' => 0]);
    $this->actingAs($c)->postJson('/media/signature', ['collection' => 'event', 'resource_type' => 'image', 'event_id' => $other->id])->assertStatus(422);
    $mine = Event::create(['user_id' => $c->id, 'title' => 'E', 'budget_total' => 0]);
    $this->actingAs($c)->postJson('/media/signature', ['collection' => 'event', 'resource_type' => 'image', 'event_id' => $mine->id])->assertOk()->assertJson(['type' => 'authenticated']);
});

it('records metadata only inside the authorized folder', function () {
    $staff = User::factory()->role(Role::Staff)->create();
    $this->actingAs($staff)->postJson('/media', uploadPayload('wp/portfolio'))->assertCreated();
    expect(MediaAsset::first()->visibility)->toBe('public');

    $this->actingAs($staff)->postJson('/media', uploadPayload('wp/portfolio', ['public_id' => 'someone-else/x']))->assertStatus(422);
    $this->actingAs($staff)->postJson('/media', uploadPayload('wp/portfolio', ['format' => 'exe']))->assertStatus(422);
    $this->actingAs($staff)->postJson('/media', uploadPayload('wp/portfolio', ['bytes' => 999_999_999]))->assertStatus(422);
    $this->actingAs($staff)->postJson('/media', uploadPayload('wp/portfolio', ['secure_url' => 'https://evil.test/x.jpg']))->assertStatus(422);
});

it('deletes only for owner or staff, and keeps the record if cloudinary fails', function () {
    $owner = User::factory()->create();
    $event = Event::create(['user_id' => $owner->id, 'title' => 'E', 'budget_total' => 0]);
    $asset = MediaAsset::create(['uploaded_by' => $owner->id, 'public_id' => "wp/events/{$event->id}/a", 'resource_type' => 'image', 'secure_url' => 'https://x', 'visibility' => 'private']);

    $this->actingAs(User::factory()->create())->deleteJson("/media/{$asset->id}")->assertForbidden();

    $this->gateway->ok = false;
    $this->actingAs($owner)->deleteJson("/media/{$asset->id}")->assertStatus(502);
    expect(MediaAsset::count())->toBe(1);

    $this->gateway->ok = true;
    $this->actingAs($owner)->deleteJson("/media/{$asset->id}")->assertOk();
    expect(MediaAsset::count())->toBe(0)->and($this->gateway->destroyed)->toContain("wp/events/{$event->id}/a");
});

it('hides private media from other users', function () {
    $owner = User::factory()->create();
    $asset = MediaAsset::create(['uploaded_by' => $owner->id, 'public_id' => 'wp/events/1/a', 'resource_type' => 'image', 'secure_url' => 'https://x', 'visibility' => 'private']);
    $this->actingAs(User::factory()->create())->get("/media/{$asset->id}")->assertForbidden();
    $this->actingAs($owner)->get("/media/{$asset->id}")->assertRedirect('https://signed.test/wp/events/1/a');
});

it('reports a graceful 503 when cloudinary is not configured', function () {
    config(['cloudinary.api_secret' => null]);
    $staff = User::factory()->role(Role::Staff)->create();
    $this->actingAs($staff)->postJson('/media/signature', ['collection' => 'portfolio', 'resource_type' => 'image'])->assertStatus(503);
});
