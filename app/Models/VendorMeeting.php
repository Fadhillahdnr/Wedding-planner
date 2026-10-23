<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;

class VendorMeeting extends Model
{
    use BelongsToWedding;

    protected $fillable = ['vendor_candidate_id', 'met_on', 'notes', 'follow_up'];

    protected function casts(): array
    {
        return ['met_on' => 'date'];
    }
}
