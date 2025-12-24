<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'code' => ['required', 'string', 'size:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Token topilmadi',
            'code.required' => 'Tasdiqlash kodini kiriting',
            'code.size' => 'Tasdiqlash kodi 6 raqamdan iborat bo\'lishi kerak',
        ];
    }
}
