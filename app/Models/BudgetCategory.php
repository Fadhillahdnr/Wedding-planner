<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetCategory extends Model
{
    use BelongsToWedding;

    protected $fillable = ['name', 'allocated_amount', 'sort_order', 'source'];

    public function items(): HasMany
    {
        return $this->hasMany(BudgetItem::class)->orderBy('sort_order')->orderBy('id');
    }
}
