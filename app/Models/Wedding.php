<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Wedding extends Model
{
    protected $fillable = [
        'partner_one_name',
        'partner_two_name',
        'target_date',
        'target_month',
        'timezone',
        'city',
        'guest_estimate',
        'total_budget',
        'contingency_percent',
        'price_buffer_percent',
        'warning_threshold_percent',
        'include_honeymoon',
        'include_prewedding',
        'tradition',
        'ceremonies',
        'onboarded_at',
    ];

    protected function casts(): array
    {
        return [
            'target_date' => 'date',
            'target_month' => 'date',
            'include_honeymoon' => 'boolean',
            'include_prewedding' => 'boolean',
            'ceremonies' => 'array',
            'onboarded_at' => 'datetime',
        ];
    }

    public function members(): HasMany
    {
        return $this->hasMany(WeddingMember::class);
    }

    public function isOnboarded(): bool
    {
        return $this->onboarded_at !== null;
    }

    /** Tanggal acuan: tanggal pasti bila ada, jika tidak pertengahan bulan perkiraan. */
    public function referenceDate(): ?Carbon
    {
        if ($this->target_date) {
            return $this->target_date->copy();
        }

        return $this->target_month?->copy()->day(15);
    }

    public function dateIsEstimated(): bool
    {
        return $this->target_date === null && $this->target_month !== null;
    }

    public function coupleLabel(): string
    {
        $names = array_filter([$this->partner_one_name, $this->partner_two_name]);

        return $names ? implode(' & ', $names) : 'Pernikahan kita';
    }
}
