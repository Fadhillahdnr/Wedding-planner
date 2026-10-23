<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WeddingSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_one_name' => ['nullable', 'string', 'max:100'],
            'partner_two_name' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'timezone' => ['required', 'timezone:all'],
            'guest_estimate' => ['nullable', 'integer', 'min:1', 'max:20000'],
            'total_budget' => ['nullable', 'integer', 'min:0', 'max:100000000000000'],
            'contingency_percent' => ['required', 'integer', 'between:0,30'],
            'price_buffer_percent' => ['required', 'integer', 'between:0,50'],
            'warning_threshold_percent' => ['required', 'integer', 'between:50,100'],
            'include_honeymoon' => ['boolean'],
            'include_prewedding' => ['boolean'],
        ];
    }
}
