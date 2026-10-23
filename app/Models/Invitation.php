<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invitation extends Model
{
    protected $fillable = ['wedding_id', 'invited_by', 'email', 'token_hash', 'expires_at', 'accepted_at', 'revoked_at'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** @return array{0: self, 1: string} Undangan dan token mentah (hanya tersedia saat ini). */
    public static function issue(Wedding $wedding, User $inviter, string $email, int $days = 7): array
    {
        $token = Str::random(48);
        $invitation = static::create([
            'wedding_id' => $wedding->id,
            'invited_by' => $inviter->id,
            'email' => strtolower($email),
            'token_hash' => static::hash($token),
            'expires_at' => now()->addDays($days),
        ]);

        return [$invitation, $token];
    }

    public static function hash(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function findUsable(string $token): ?self
    {
        return static::query()
            ->where('token_hash', static::hash($token))
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
