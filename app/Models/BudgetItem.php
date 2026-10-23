<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetItem extends Model
{
    protected $fillable = ['event_id', 'category', 'name', 'estimated', 'actual'];

    protected function casts(): array
    {
        return ['estimated' => 'decimal:2', 'actual' => 'decimal:2'];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
