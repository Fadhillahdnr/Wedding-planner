<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\PricingMode;
use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetItem extends Model
{
    use BelongsToWedding;

    protected $fillable = [
        'budget_category_id',
        'name',
        'pricing_mode',
        'estimate_min',
        'estimate_max',
        'price_per_guest',
        'agreed_amount',
        'notes',
        'sort_order',
        'source',
    ];

    protected function casts(): array
    {
        return ['pricing_mode' => PricingMode::class];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class, 'budget_category_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('due_date');
    }

    /** Total pembayaran yang sudah lunas; dihitung dari jadwal pembayaran, bukan diisi manual. */
    public function paidAmount(): int
    {
        return (int) $this->payments()->where('status', PaymentStatus::Paid->value)->sum('amount');
    }
}
