<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;

class FundingSource extends Model
{
    use BelongsToWedding;

    protected $fillable = ['name', 'collected_amount', 'target_amount', 'monthly_contribution'];
}
