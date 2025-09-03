<?php

namespace App\Http\Requests\WarehouseType;

use Illuminate\Foundation\Http\FormRequest;

class StoreWarehouseTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
                'unique:warehouse_types,title'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Поле "Название" обязательно для заполнения.',
            'title.string' => 'Поле "Название" должно быть строкой.',
            'title.max' => 'Поле "Название" не должно превышать :max символов.',
            'title.unique' => 'Тип склада с таким названием уже существует.',
        ];
    }
}