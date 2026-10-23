<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use App\Services\Media\MediaLibrary;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Memory extends Model
{
    use BelongsToWedding;

    protected $fillable = ['title', 'caption', 'happened_on'];

    protected static function booted(): void
    {
        static::deleting(fn (self $m) => app(MediaLibrary::class)->purgeFor($m));
    }

    public function media(): MorphMany
    {
        return $this->morphMany(MediaAsset::class, 'mediable')->where('status', 'ready')->oldest();
    }

    protected function casts(): array
    {
        return ['happened_on' => 'date'];
    }
}
