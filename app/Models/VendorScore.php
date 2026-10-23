<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorScore extends Model
{
    protected $fillable = ['vendor_candidate_id', 'score_criterion_id', 'score'];
}
