<?php

namespace App\Http\Requests\Order;

use App\Http\Requests\BaseApiRequest;

class CreateOrderRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'amount' => ['required', 'integer', 'min:0'],
            'module_ids' => ['nullable', 'array'],
            'user_count' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'billing_period' => ['nullable', 'string', 'in:monthly,yearly'],
            'package_name' => ['nullable', 'string', 'max:150'],
        ];
    }

    public function messages(): array {
        return [
            'amount.required' => 'مبلغ سفارش الزامی است',
            'amount.integer' => 'مبلغ سفارش باید عدد باشد',
            'billing_period.in' => 'دوره صورتحساب باید ماهانه یا سالانه باشد',
        ];
    }
}
