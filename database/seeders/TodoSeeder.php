<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Seeder;

class TodoSeeder extends Seeder
{
    public function run(): void
    {
        $tagIds = Tag::pluck('id');   // one query, reused for every todo

        foreach (User::whereIn('email', ['demo@example.com', 'second@example.com'])->get() as $user) {
            // Skip users who already have todos, so running the seeder twice doesn't duplicate data.
            if (Todo::where('user_id', $user->id)->exists()) {
                continue;
            }

            $categoryIds = Category::where('user_id', $user->id)->pluck('id');

            for ($i = 0; $i < 25; $i++) {
                $todo = Todo::factory()->create([
                    'user_id'     => $user->id,
                    'category_id' => fake()->boolean(80) ? $categoryIds->random() : null,
                    // from 10 days ago (overdue) to 30 days ahead
                    'due_date'    => fake()->boolean(70)
                        ? fake()->dateTimeBetween('-10 days', '+30 days')
                        : null,
                ]);

                $todo->tags()->attach($tagIds->shuffle()->take(rand(0, 3))->all());
            }
        }
    }
}