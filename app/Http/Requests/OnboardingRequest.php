<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Semua langkah boleh dilewati, jadi hampir semua field opsional. */
    public function rules(): array
    {
        return [
            'partner_one_name' => ['nullable', 'string', 'max:100'],
            'partner_two_name' => ['nullable', 'string', 'max:100'],
            'target_date' => ['nullable', 'date', 'after:today'],
            'target_month' => ['nullable', 'date_format:Y-m'],
            'city' => ['nullable', 'string', 'max:100'],
            'guest_estimate' => ['nullable', 'integer', 'min:1', 'max:20000'],
            'total_budget' => ['nullable', 'integer', 'min:0', 'max:100000000000000'],
            'tradition' => ['nullable', 'string', 'max:100'],
            'ceremonies' => ['nullable', 'array', 'max:10'],
            'ceremonies.*' => ['string', 'max:60'],
            'include_honeymoon' => ['boolean'],
            'include_prewedding' => ['boolean'],
            'funding_name' => ['nullable', 'string', 'max:100'],
            'funding_collected' => ['nullable', 'integer', 'min:0'],
            'funding_monthly' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
