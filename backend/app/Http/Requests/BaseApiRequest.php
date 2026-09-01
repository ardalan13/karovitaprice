<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class BaseApiRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    protected function failedValidation(Validator $validator) {
        $firstError = $validator->errors()->first();
        throw new HttpResponseException(
            response()->json([
                'error' => $firstError,
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
