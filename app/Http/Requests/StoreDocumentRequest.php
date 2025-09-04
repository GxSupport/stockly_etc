<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'number' => 'required|string|max:255',
            'type' => 'required|integer',
            'subscriber_title' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'date_order' => 'nullable|date',
            'in_charge' => 'nullable|string|max:255',
            'main_tool' => 'nullable|string|max:255',
            'total_amount' => 'nullable|numeric',
            'is_finished' => 'boolean',
            'products' => 'required|array|min:1',
            'products.*.title' => 'required|string|max:255',
            'products.*.measure' => 'required|string|max:255',
            'products.*.quantity' => 'required|numeric|min:1',
            'products.*.amount' => 'required|numeric|min:0',
            'products.*.nomenclature' => 'nullable|string|max:255',
            'products.*.note' => 'nullable|string|max:500',
        ];
    }

    public function messages()
    {
        return [
            'number.required' => 'Номер документа обязателен',
            'type.required' => 'Тип документа обязателен',
            'products.required' => 'Необходимо добавить хотя бы один товар',
            'products.min' => 'Необходимо добавить хотя бы один товар',
            'products.*.title.required' => 'Название товара обязательно',
            'products.*.measure.required' => 'Единица измерения обязательна',
            'products.*.quantity.required' => 'Количество обязательно',
            'products.*.quantity.min' => 'Количество должно быть больше 0',
            'products.*.amount.required' => 'Сумма обязательна',
            'products.*.amount.min' => 'Сумма не может быть отрицательной',
        ];
    }
}
