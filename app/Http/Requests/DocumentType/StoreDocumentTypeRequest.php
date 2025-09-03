<?php

namespace App\Http\Requests\DocumentType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:10',
                Rule::unique('document_type', 'code')
            ],
            'title' => [
                'required',
                'string',
                'max:255'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Поле "Код" обязательно для заполнения.',
            'code.string' => 'Поле "Код" должно быть строкой.',
            'code.max' => 'Поле "Код" не должно превышать :max символов.',
            'code.unique' => 'Тип документа с таким кодом уже существует.',
            'title.required' => 'Поле "Название" обязательно для заполнения.',
            'title.string' => 'Поле "Название" должно быть строкой.',
            'title.max' => 'Поле "Название" не должно превышать :max символов.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper($this->code),
        ]);
    }
}