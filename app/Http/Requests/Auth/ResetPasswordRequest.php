<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Token topilmadi',
            'password.required' => 'Parolni kiriting',
            'password.confirmed' => 'Parollar mos kelmadi',
            'password.min' => 'Parol kamida 8 belgidan iborat bo\'lishi kerak',
        ];
    }
}
