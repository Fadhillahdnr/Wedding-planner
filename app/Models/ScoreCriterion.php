<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;

class ScoreCriterion extends Model
{
    use BelongsToWedding;

    protected $table = 'score_criteria';

    protected $fillable = ['name', 'weight', 'sort_order'];
}
