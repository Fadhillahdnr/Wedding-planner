<?php

namespace App\Http\Requests;

use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'budget_item_id' => ['required', 'integer', Rule::exists('budget_items', 'id')->where('wedding_id', $this->user()->weddingId())],
            'label' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'integer', 'min:1', 'max:100000000000000'],
            'due_date' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(PaymentStatus::class)],
            'paid_on' => ['nullable', 'date', 'required_if:status,lunas'],
            'method' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
