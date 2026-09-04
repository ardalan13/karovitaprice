<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'mobile' => '0912' . fake()->numerify('#######'),
            'national_code' => fake()->numerify('##########'),
            'email' => fake()->unique()->safeEmail(),
            'role' => 'user',
            'status' => 'active',
        ];
    }
}
