<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseApiRequest;

class UpdateProfileRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['nullable', 'email', 'max:150'],
            'avatar' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array {
        return [
            'name.required' => 'نام و نام‌خانوادگی الزامی است',
            'name.min' => 'نام باید حداقل ۲ کاراکتر باشد',
            'email.email' => 'فرمت ایمیل وارد شده نامعتبر است',
        ];
    }
}
