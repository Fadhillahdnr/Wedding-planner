<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorCategory extends Model
{
    protected $fillable = ['name', 'slug', 'sort_order'];

    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class);
    }
}
