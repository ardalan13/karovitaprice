<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateUserStatusRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'status' => ['required', 'string', 'in:active,suspended'],
        ];
    }

    public function messages(): array {
        return [
            'status.required' => 'وضعیت کاربر الزامی است',
            'status.in' => 'وضعیت انتخاب‌شده نامعتبر است (باید active یا suspended باشد)',
        ];
    }
}
