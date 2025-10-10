<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserRoles>
 */
class UserRolesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->randomElement(['admin', 'manager', 'employee', 'intern']),
            'name' => fake()->randomElement(['Администратор', 'Менеджер', 'Сотрудник', 'Стажер']),
            'is_active' => true,
        ];
    }
}
