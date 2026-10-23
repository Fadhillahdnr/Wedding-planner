<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PortfolioProject extends Model
{
    protected $fillable = ['title', 'slug', 'category', 'summary', 'event_date', 'location', 'is_published'];

    protected function casts(): array
    {
        return ['event_date' => 'date', 'is_published' => 'boolean'];
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
