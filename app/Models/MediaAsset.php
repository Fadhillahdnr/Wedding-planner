<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MediaAsset extends Model
{
    protected $fillable = ['mediable_type', 'mediable_id', 'uploaded_by', 'provider', 'public_id', 'resource_type', 'format', 'secure_url', 'width', 'height', 'duration', 'bytes', 'alt_text', 'visibility', 'status', 'collection'];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function isPrivate(): bool
    {
        return $this->visibility === 'private';
    }
}
