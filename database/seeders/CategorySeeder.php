<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        foreach (User::whereIn('email', ['demo@example.com', 'second@example.com'])->get() as $user) {
            foreach (['Work', 'Personal', 'Study', 'Shopping'] as $name) {
                Category::firstOrCreate(['user_id' => $user->id, 'name' => $name]);
            }
        }
    }
}