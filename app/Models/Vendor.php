<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Vendor extends Model
{
    public const STATUSES = ['draft', 'pending', 'published'];

    protected $fillable = ['user_id', 'vendor_category_id', 'name', 'slug', 'description', 'city', 'price_min', 'price_max', 'currency', 'contact_email', 'contact_phone', 'status', 'is_featured'];

    protected function casts(): array
    {
        return ['price_min' => 'decimal:2', 'price_max' => 'decimal:2', 'is_featured' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(VendorCategory::class, 'vendor_category_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(MediaAsset::class, 'mediable');
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
