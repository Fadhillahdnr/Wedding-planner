<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use BelongsToWedding;

    public $timestamps = false;

    protected $fillable = ['user_id', 'action', 'context'];

    protected function casts(): array
    {
        return ['context' => 'array', 'created_at' => 'datetime'];
    }
}
