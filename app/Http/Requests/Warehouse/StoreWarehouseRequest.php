<?php

namespace App\Http\Requests\Warehouse;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWarehouseRequest extends FormRequest
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
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('warehouse', 'code')
            ],
            'title' => [
                'required',
                'string',
                'max:255'
            ],
            'type' => [
                'required',
                'integer',
                'exists:warehouse_type,id'
            ],
            'comment' => [
                'nullable',
                'string',
                'max:1000'
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
            'code.required' => 'Код склада обязателен для заполнения.',
            'code.string' => 'Код склада должен быть строкой.',
            'code.max' => 'Код склада не может быть длиннее 50 символов.',
            'code.regex' => 'Код склада может содержать только заглавные буквы, цифры, дефисы и подчеркивания.',
            'code.unique' => 'Склад с таким кодом уже существует.',
            
            'title.required' => 'Название склада обязательно для заполнения.',
            'title.string' => 'Название склада должно быть строкой.',
            'title.max' => 'Название склада не может быть длиннее 255 символов.',
            
            'type.required' => 'Тип склада обязателен для выбора.',
            'type.integer' => 'Тип склада должен быть числом.',
            'type.exists' => 'Выбранный тип склада не существует.',
            
            'comment.string' => 'Комментарий должен быть строкой.',
            'comment.max' => 'Комментарий не может быть длиннее 1000 символов.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper($this->code),
        ]);
    }
}