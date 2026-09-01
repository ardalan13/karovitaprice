<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateUserRoleRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'role' => ['required', 'string', 'in:admin,user,support'],
        ];
    }

    public function messages(): array {
        return [
            'role.required' => 'نقش کاربری الزامی است',
            'role.in' => 'نقش انتخاب‌شده نامعتبر است (باید admin، user یا support باشد)',
        ];
    }
}
