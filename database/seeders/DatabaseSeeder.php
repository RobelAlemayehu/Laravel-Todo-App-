<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Order matters: todos need users, categories and tags first.
        $this->call([
            TagSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            TodoSeeder::class,
        ]);
    }
}