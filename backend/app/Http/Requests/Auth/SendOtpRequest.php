<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;

class SendOtpRequest extends BaseApiRequest {
    protected function prepareForValidation() {
        if ($this->has('mobile')) {
            $mobile = (string) $this->input('mobile');
            $mobile = strtr($mobile, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']);
            $this->merge(['mobile' => trim($mobile)]);
        }
    }

    public function rules(): array {
        return [
            'mobile' => ['required', 'string', 'regex:/^09[0-9]{9}$/'],
        ];
    }

    public function messages(): array {
        return [
            'mobile.required' => 'شماره موبایل الزامی است',
            'mobile.regex' => 'شماره موبایل وارد شده نامعتبر است (باید ۱۱ رقمی و با ۰۹ شروع شود)',
        ];
    }
}
