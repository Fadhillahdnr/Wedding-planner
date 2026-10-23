<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Package extends Model
{
    protected $fillable = ['name', 'slug', 'tagline', 'description', 'price_from', 'currency', 'is_featured', 'is_published', 'sort_order'];

    protected function casts(): array
    {
        return ['price_from' => 'decimal:2', 'is_featured' => 'boolean', 'is_published' => 'boolean'];
    }

    public function features(): HasMany
    {
        return $this->hasMany(PackageFeature::class)->orderBy('sort_order');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(MediaAsset::class, 'mediable');
    }

    public function scopePublished($q)
    {
        return $q->where('is_published', true);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
