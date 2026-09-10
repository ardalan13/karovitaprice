<?php

namespace App\Http\Requests\Ticket;

use App\Http\Requests\BaseApiRequest;

class StoreTicketRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'subject' => ['required', 'string', 'min:3', 'max:200'],
            'message' => ['required', 'string', 'min:5', 'max:5000'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'service_name' => ['nullable', 'string', 'max:150'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,emergency'],
            'attachments' => ['nullable', 'array'],
        ];
    }

    public function messages(): array {
        return [
            'subject.required' => 'موضوع تیکت الزامی است',
            'subject.min' => 'موضوع تیکت باید حداقل ۳ کاراکتر باشد',
            'message.required' => 'متن پیام تیکت الزامی است',
            'message.min' => 'متن پیام باید حداقل ۵ کاراکتر باشد',
            'department_id.exists' => 'دپارتمان انتخاب‌شده نامعتبر است',
            'priority.in' => 'اولویت انتخاب‌شده نامعتبر است',
        ];
    }
}
