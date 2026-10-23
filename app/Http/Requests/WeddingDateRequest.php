<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WeddingDateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_date' => ['nullable', 'date', 'required_without:target_month'],
            'target_month' => ['nullable', 'date_format:Y-m', 'required_without:target_date'],
        ];
    }
}
