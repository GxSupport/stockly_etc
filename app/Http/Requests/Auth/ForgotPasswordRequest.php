<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Telefon raqamini kiriting',
        ];
    }

    /**
     * Get the cleaned phone number (digits only).
     */
    public function getCleanPhone(): string
    {
        return str_replace([' ', '-', '(', ')', '+'], '', $this->phone);
    }

    /**
     * Ensure the request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        $key = 'password-reset:'.$this->getCleanPhone();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);

            throw ValidationException::withMessages([
                'phone' => "Juda ko'p urinish. {$minutes} daqiqadan keyin qayta urinib ko'ring.",
            ]);
        }

        RateLimiter::hit($key, 900); // 15 minutes
    }
}
