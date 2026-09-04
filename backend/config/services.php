<?php

return [

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // Iranian Gateway & SMS Configurations
    'zibal' => [
        'merchant' => env('ZIBAL_MERCHANT', 'zibal'),
        'sandbox' => env('ZIBAL_SANDBOX', true),
        'callback_url' => env('ZIBAL_CALLBACK_URL'),
    ],

    'kavenegar' => [
        'api_key' => env('KAVENEGAR_API_KEY'),
        'sender' => env('KAVENEGAR_SENDER', '10008663'),
    ],

    'farazsms' => [
        'api_key' => env('FARAZSMS_API_KEY'),
        'sender' => env('FARAZSMS_SENDER'),
        'pattern_code' => env('FARAZSMS_PATTERN_CODE'),
    ],

    'sms_ir' => [
        'api_key' => env('SMS_IR_API_KEY', 'ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z'),
        'line_number' => env('SMS_IR_LINE_NUMBER', '30007732'),
        'template_otp' => env('SMS_IR_TEMPLATE_OTP', 418155),
        'template_invoice' => env('SMS_IR_TEMPLATE_INVOICE', 418155),
        'template_payment' => env('SMS_IR_TEMPLATE_PAYMENT', 418155),
    ],

];
