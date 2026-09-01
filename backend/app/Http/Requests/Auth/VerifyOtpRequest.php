<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;

class VerifyOtpRequest extends BaseApiRequest {
    protected function prepareForValidation() {
        $mobile = (string) $this->input('mobile', '');
        $code = (string) $this->input('code', '');
        $mobile = strtr($mobile, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']);
        $code = strtr($code, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']);

        $this->merge([
            'mobile' => trim($mobile),
            'code' => trim($code),
        ]);
    }

    public function rules(): array {
        return [
            'mobile' => ['required', 'string', 'regex:/^09[0-9]{9}$/'],
            'code' => ['required', 'string', 'min:4', 'max:10'],
        ];
    }

    public function messages(): array {
        return [
            'mobile.required' => 'شماره موبایل الزامی است',
            'mobile.regex' => 'شماره موبایل نامعتبر است',
            'code.required' => 'کد تایید الزامی است',
            'code.min' => 'کد تایید حداقل باید ۴ رقم باشد',
            'code.max' => 'کد تایید حداکثر می‌تواند ۱۰ رقم باشد',
        ];
    }
}
