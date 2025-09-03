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
            'subscriber_title' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'date_order' => 'required|date',
            'in_charge' => 'required|string|max:255',
            'total_amount' => 'required|numeric',
            'is_finished' => 'boolean',
            'products' => 'array',
            'products.*.title' => 'required|string|max:255',
            'products.*.measure' => 'required|string|max:255',
            'products.*.quantity' => 'required|numeric',
            'products.*.amount' => 'required|numeric',
        ];
    }
}
