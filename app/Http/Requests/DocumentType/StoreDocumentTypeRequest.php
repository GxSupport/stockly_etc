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
                Rule::unique('document_type', 'code'),
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'workflow_type' => [
                'required',
                'integer',
                'in:1,2',
            ],
            'requires_deputy_approval' => [
                'boolean',
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
            'workflow_type.required' => 'Поле "Тип согласования" обязательно для заполнения.',
            'workflow_type.integer' => 'Поле "Тип согласования" должно быть числом.',
            'workflow_type.in' => 'Поле "Тип согласования" должно быть 1 или 2.',
            'requires_deputy_approval.boolean' => 'Поле "Требуется согласование зам. директора" должно быть логическим значением.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper($this->code),
        ]);
    }
}
