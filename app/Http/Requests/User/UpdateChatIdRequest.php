<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateChatIdRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'chat_id' => ['required', 'string', 'max:36'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'chat_id.required' => 'Telegram ID kiritilishi shart.',
            'chat_id.string' => 'Telegram ID matn bo\'lishi kerak.',
            'chat_id.max' => 'Telegram ID 36 ta belgidan oshmasligi kerak.',
        ];
    }
}
