<?php

namespace Database\Factories;

use App\Models\BasicResource;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BasicResource>
 */
class BasicResourceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->numerify('00-######'),
            'name' => $this->faker->sentence(4),
            'warehouse_name' => $this->faker->optional()->streetAddress(),
        ];
    }
}
