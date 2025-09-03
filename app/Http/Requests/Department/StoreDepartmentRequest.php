<?php

namespace App\Http\Requests\Department;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDepartmentRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'dep_code' => [
                'required',
                'string',
                'max:10',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('dep_list', 'dep_code')
            ],
            'title' => [
                'required',
                'string',
                'max:255'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'dep_code.required' => 'Код отдела обязателен для заполнения.',
            'dep_code.string' => 'Код отдела должен быть строкой.',
            'dep_code.max' => 'Код отдела не может быть длиннее 10 символов.',
            'dep_code.regex' => 'Код отдела может содержать только заглавные буквы, цифры, дефисы и подчеркивания.',
            'dep_code.unique' => 'Отдел с таким кодом уже существует.',
            
            'title.required' => 'Название отдела обязательно для заполнения.',
            'title.string' => 'Название отдела должно быть строкой.',
            'title.max' => 'Название отдела не может быть длиннее 255 символов.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'dep_code' => strtoupper($this->dep_code),
        ]);
    }
}