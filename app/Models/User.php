<?php

namespace App\Models;

use App\Enums\MemberRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    private ?WeddingMember $cachedMembership = null;

    private bool $membershipResolved = false;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function membership(): HasOne
    {
        return $this->hasOne(WeddingMember::class);
    }

    /** Dimuat eksplisit (bukan lazy-load relasi) dan disimpan per instance karena dipakai di tiap query ber-scope. */
    private function resolveMembership(): ?WeddingMember
    {
        if (! $this->membershipResolved) {
            $this->cachedMembership = WeddingMember::query()->with('wedding')->where('user_id', $this->id)->first();
            $this->membershipResolved = true;
        }

        return $this->cachedMembership;
    }

    public function wedding(): ?Wedding
    {
        return $this->resolveMembership()?->wedding;
    }

    public function weddingId(): ?int
    {
        return $this->resolveMembership()?->wedding_id;
    }

    public function isOwner(): bool
    {
        return $this->resolveMembership()?->role === MemberRole::Owner;
    }
}
