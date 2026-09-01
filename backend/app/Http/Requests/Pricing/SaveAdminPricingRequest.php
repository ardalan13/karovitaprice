<?php

namespace App\Http\Requests\Pricing;

use App\Http\Requests\BaseApiRequest;

class SaveAdminPricingRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'modules' => ['required', 'array', 'min:1'],
            'modules.*.id' => ['required', 'string', 'max:50'],
            'modules.*.title' => ['required', 'string', 'max:150'],
            'modules.*.price' => ['required', 'numeric', 'min:0'],
            'modules.*.category' => ['nullable', 'string', 'max:50'],
            'modules.*.is_active' => ['nullable', 'boolean'],
            'modules.*.description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array {
        return [
            'modules.required' => 'لیست ماژول‌ها الزامی است',
            'modules.*.id.required' => 'شناسه ماژول الزامی است',
            'modules.*.title.required' => 'عنوان ماژول الزامی است',
            'modules.*.price.required' => 'قیمت ماژول الزامی است',
            'modules.*.price.numeric' => 'قیمت ماژول باید عدد باشد',
        ];
    }
}
