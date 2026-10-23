<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{7,30}$/'],
            'event_date' => ['nullable', 'date', 'after:today'],
            'location' => ['nullable', 'string', 'max:150'],
            'budget' => ['nullable', 'numeric', 'min:0', 'max:100000000000'],
            'message' => ['nullable', 'string', 'max:2000'],
            // Honeypot: bot mengisi field ini, manusia tidak.
            'website' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon tidak valid.',
            'event_date.after' => 'Tanggal acara harus setelah hari ini.',
        ];
    }
}
