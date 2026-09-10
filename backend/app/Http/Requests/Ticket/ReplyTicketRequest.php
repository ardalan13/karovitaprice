<?php

namespace App\Http\Requests\Ticket;

use App\Http\Requests\BaseApiRequest;

class ReplyTicketRequest extends BaseApiRequest {
    public function rules(): array {
        return [
            'message' => ['required', 'string', 'min:2', 'max:5000'],
            'attachments' => ['nullable', 'array'],
        ];
    }

    public function messages(): array {
        return [
            'message.required' => 'متن پیام الزامی است',
            'message.min' => 'متن پیام باید حداقل ۲ کاراکتر باشد',
        ];
    }
}
