<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id;

        return [
            'name' => 'sometimes|string|max:255',
            'phone' => [
                'sometimes',
                'string',
                'max:20',
                'regex:/^[0-9+\s\-()]+$/',
                Rule::unique('users', 'phone')->ignore($employeeId),
            ],
            'password' => 'sometimes|nullable|string|min:6',
            'role_id' => 'sometimes|exists:user_roles,title',
            'dep_code' => 'sometimes|nullable|exists:dep_list,dep_code',
            'chat_id' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|required|string|in:admin,director,buxgalter,user,frp',
            'warehouse_id' => 'sometimes|nullable|exists:warehouse,id|required_if:type,frp',
            'senior_id' => 'sometimes|nullable|exists:users,id',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Имя должно быть строкой',
            'name.max' => 'Имя не должно превышать 255 символов',
            'phone.string' => 'Телефон должен быть строкой',
            'phone.regex' => 'Неверный формат телефона',
            'phone.unique' => 'Пользователь с таким телефоном уже существует',
            'password.min' => 'Пароль должен быть не менее 6 символов',
            'role_id.exists' => 'Указанная роль не существует',
            'dep_code.exists' => 'Указанный отдел не существует или неактивен',
            'type.required' => 'Необходимо указать тип пользователя',
            'type.in' => 'Недопустимый тип пользователя',
            'warehouse_id.exists' => 'Указанный склад не существует',
            'warehouse_id.required_if' => 'Склад обязателен для МОЛ пользователей',
            'senior_id.exists' => 'Указанный руководитель не существует',
            'is_active.boolean' => 'Статус активности должен быть булевым значением',
        ];
    }
}
