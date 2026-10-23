<?php

namespace App\Models;

use App\Enums\CandidateStatus;
use App\Enums\VendorNeed;
use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class VendorSlot extends Model
{
    use BelongsToWedding;

    protected $fillable = ['budget_item_id', 'name', 'need', 'ideal_months_before', 'sort_order', 'source'];

    protected function casts(): array
    {
        return ['need' => VendorNeed::class];
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(VendorCandidate::class)->orderBy('id');
    }

    public function chosen(): HasOne
    {
        return $this->hasOne(VendorCandidate::class)->where('status', CandidateStatus::Chosen->value);
    }

    public function budgetItem(): BelongsTo
    {
        return $this->belongsTo(BudgetItem::class);
    }
}
