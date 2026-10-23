<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $fillable = ['user_id', 'event_id', 'package_id', 'vendor_id', 'preferred_date', 'status', 'payment_status', 'notes'];

    protected function casts(): array
    {
        return ['preferred_date' => 'date', 'status' => BookingStatus::class];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(BookingStatusHistory::class)->latest('id');
    }
}
