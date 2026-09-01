<?php

namespace App\Http\Requests\Order;

use App\Http\Requests\BaseApiRequest;

class VerifyTransactionRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'order_id' => ['required', 'integer', 'exists:orders,id'],
        ];
    }

    public function messages(): array {
        return [
            'order_id.required' => 'شناسه سفارش الزامی است',
            'order_id.exists' => 'سفارش مورد نظر یافت نشد',
        ];
    }
}
