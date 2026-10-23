<?php

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Concerns\BelongsToWedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use BelongsToWedding;

    protected $fillable = [
        'assignee_id',
        'vendor_slot_id',
        'title',
        'description',
        'due_date',
        'status',
        'priority',
        'phase',
        'offset_value',
        'offset_unit',
        'date_locked',
        'needs_reschedule',
        'source',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => TaskStatus::class,
            'priority' => TaskPriority::class,
            'due_date' => 'date',
            'date_locked' => 'boolean',
            'needs_reschedule' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}
