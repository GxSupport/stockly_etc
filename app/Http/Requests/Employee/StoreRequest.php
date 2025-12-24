<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:user_roles,title',
            'dep_code' => 'required|exists:dep_list,dep_code',
            'senior_id' => 'nullable|required_if:role_id,frp|exists:users,id',
            'warehouse_id' => 'nullable|required_if:role_id,frp|exists:warehouses,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Необходимо указать имя',
            'phone.required' => 'Необходимо указать телефон',
            'phone.unique' => 'Пользователь с таким телефоном уже существует',
            'password.required' => 'Необходимо указать пароль',
            'password.min' => 'Пароль должен быть не менее 8 символов',
            'password.confirmed' => 'Пароли не совпадают',
            'role_id.required' => 'Необходимо указать роль',
            'role_id.exists' => 'Указанная роль не существует',
            'dep_code.required' => 'Необходимо указать отдел',
            'dep_code.exists' => 'Указанный отдел не существует',
            'warehouse_id.required_if' => 'Необходимо указать склад для роли ФРП',
            'warehouse_id.exists' => 'Указанный склад не существует',
            'senior_id.required_if' => 'Необходимо указать руководителя для роли ФРП',
            'senior_id.exists' => 'Указанный руководитель не существует',
        ];
    }
}
