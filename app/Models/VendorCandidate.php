<?php

namespace App\Models;

use App\Enums\CandidateStatus;
use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorCandidate extends Model
{
    use BelongsToWedding;

    protected $fillable = [
        'vendor_slot_id',
        'name',
        'city',
        'phone',
        'instagram',
        'website',
        'package_name',
        'quoted_price',
        'quoted_on',
        'quote_valid_until',
        'inclusions',
        'exclusions',
        'pros',
        'cons',
        'source',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => CandidateStatus::class,
            'quoted_on' => 'date',
            'quote_valid_until' => 'date',
        ];
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(VendorSlot::class, 'vendor_slot_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(VendorScore::class);
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(VendorMeeting::class)->orderByDesc('met_on');
    }
}
