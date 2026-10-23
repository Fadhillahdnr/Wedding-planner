<?php

namespace App\Models;

use App\Enums\LeadStatus;
use Illuminate\Database\Eloquent\Model;

class ConsultationLead extends Model
{
    protected $fillable = ['user_id', 'name', 'email', 'phone', 'event_date', 'location', 'budget', 'message', 'status'];

    protected function casts(): array
    {
        return ['event_date' => 'date', 'budget' => 'decimal:2', 'status' => LeadStatus::class];
    }
}
