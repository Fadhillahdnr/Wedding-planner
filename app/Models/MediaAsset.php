<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MediaAsset extends Model
{
    use BelongsToWedding;

    protected $fillable = [
        'uploaded_by',
        'mediable_type',
        'mediable_id',
        'provider',
        'public_id',
        'kind',
        'resource_type',
        'delivery_type',
        'format',
        'width',
        'height',
        'bytes',
        'alt_text',
        'caption',
        'status',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
}
