<?php

namespace App\Http\Requests;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $memberIds = $this->user()->wedding()?->members()->pluck('user_id')->all() ?? [];

        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:3000'],
            'due_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::enum(TaskStatus::class)],
            'priority' => ['sometimes', Rule::enum(TaskPriority::class)],
            'assignee_id' => ['nullable', 'integer', Rule::in($memberIds)],
            'vendor_slot_id' => ['nullable', 'integer', Rule::exists('vendor_slots', 'id')->where('wedding_id', $this->user()->weddingId())],
            'date_locked' => ['sometimes', 'boolean'],
        ];
    }
}
