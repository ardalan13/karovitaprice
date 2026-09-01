<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseApiRequest;

class SaveCompanyRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'national_id' => ['nullable', 'string', 'max:30'],
            'registration_number' => ['nullable', 'string', 'max:30'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array {
        return [
            'name.required' => 'نام شرکت یا مجموعه الزامی است',
            'name.min' => 'نام شرکت باید حداقل ۲ کاراکتر باشد',
        ];
    }
}
