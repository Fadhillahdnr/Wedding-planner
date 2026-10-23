<?php

namespace App\Http\Requests;

use App\Enums\PricingMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Rule::exists memakai query mentah (tanpa global scope), jadi workspace dibatasi eksplisit.
            'budget_category_id' => ['required', 'integer', Rule::exists('budget_categories', 'id')->where('wedding_id', $this->user()->weddingId())],
            'name' => ['required', 'string', 'max:150'],
            'pricing_mode' => ['required', Rule::enum(PricingMode::class)],
            'estimate_min' => ['nullable', 'integer', 'min:0', 'max:100000000000000'],
            'estimate_max' => ['nullable', 'integer', 'min:0', 'max:100000000000000', 'gte:estimate_min'],
            'price_per_guest' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'agreed_amount' => ['nullable', 'integer', 'min:0', 'max:100000000000000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
