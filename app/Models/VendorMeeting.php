<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use App\Services\Media\MediaLibrary;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class VendorMeeting extends Model
{
    use BelongsToWedding;

    protected $fillable = ['vendor_candidate_id', 'met_on', 'notes', 'follow_up'];

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
        return ['met_on' => 'date'];
    }
}
