<?php

namespace App\Http\Requests;

use App\Enums\CandidateStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VendorCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]*$/'],
            'instagram' => ['nullable', 'string', 'max:100', 'regex:/^@?[A-Za-z0-9._]*$/'],
            // Hanya http/https; server tidak pernah mengambil isi URL ini.
            'website' => ['nullable', 'url:http,https', 'max:255'],
            'package_name' => ['nullable', 'string', 'max:150'],
            'quoted_price' => ['nullable', 'integer', 'min:0', 'max:100000000000000'],
            'quoted_on' => ['nullable', 'date'],
            'quote_valid_until' => ['nullable', 'date', 'after_or_equal:quoted_on'],
            'inclusions' => ['nullable', 'string', 'max:3000'],
            'exclusions' => ['nullable', 'string', 'max:3000'],
            'pros' => ['nullable', 'string', 'max:2000'],
            'cons' => ['nullable', 'string', 'max:2000'],
            'source' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::enum(CandidateStatus::class), Rule::notIn(['terpilih'])],
            'notes' => ['nullable', 'string', 'max:3000'],
            'scores' => ['nullable', 'array'],
            'scores.*' => ['nullable', 'integer', 'between:1,5'],
        ];
    }

    public function messages(): array
    {
        return ['status.not_in' => 'Gunakan tombol "Pilih vendor ini" untuk menetapkan kandidat terpilih.'];
    }
}
