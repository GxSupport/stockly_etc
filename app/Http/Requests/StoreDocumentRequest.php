<?php

namespace App\Http\Requests;

use App\Models\DocumentType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            'number' => 'required|string|max:255',
            'document_type_id' => 'required|integer',
            'subscriber_title' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'date_order' => 'nullable|date',
            'in_charge' => 'nullable|string|max:255',
            'main_tool' => 'nullable|string|max:255',
            'requires_deputy_approval' => 'nullable|boolean',
            'total_amount' => 'nullable|numeric',
            'is_finished' => 'boolean',
            'note' => 'nullable|string|max:1000',
            'products' => 'required|array|min:1',
            'products.*.id' => 'nullable',
            'products.*.selected_product' => 'nullable|array',
            'products.*.product_name' => 'required|string|max:500',
            'products.*.measure' => 'required|string|max:50',
            'products.*.quantity' => 'required|numeric|min:1',
            'products.*.amount' => 'required|numeric|min:0',
            'products.*.nomenclature' => 'nullable|string|max:255',
            'products.*.warehouse_code' => 'nullable|string|max:50',
            'products.*.warehouse_name' => 'nullable|string|max:255',
            'products.*.max_quantity' => 'nullable|numeric',
            'products.*.note' => 'nullable|string|max:500',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'number.required' => 'Номер документа обязателен',
            'document_type_id.required' => 'Тип документа обязателен',
            'products.required' => 'Необходимо добавить хотя бы один товар',
            'products.min' => 'Необходимо добавить хотя бы один товар',
            'products.*.product_name.required' => 'Название товара обязательно',
            'products.*.measure.required' => 'Единица измерения обязательна',
            'products.*.quantity.required' => 'Количество обязательно',
            'products.*.quantity.min' => 'Количество должно быть больше 0',
            'products.*.amount.required' => 'Сумма обязательна',
            'products.*.amount.min' => 'Сумма не может быть отрицательной',
        ];
    }

    /**
     * Демонтажа aktida sklad (место демонтажа) majburiy — aks holda PDF matnida bo'sh qo'shtirnoq qoladi.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->isDismantlingDocument() && trim((string) $this->input('main_tool')) === '') {
                $validator->errors()->add('main_tool', 'Выберите склад в поле «Место демонтажа»');
            }
        });
    }

    protected function isDismantlingDocument(): bool
    {
        $typeId = (int) $this->input('document_type_id');

        if ($typeId === 0) {
            return false;
        }

        $documentType = DocumentType::query()->find($typeId, ['id', 'code']);

        return $documentType !== null && ($documentType->code === 'dismantling' || (int) $documentType->id === 2);
    }
}
