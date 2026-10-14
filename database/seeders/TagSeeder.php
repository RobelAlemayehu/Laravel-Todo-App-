<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['urgent', 'home', 'work', 'study', 'health', 'ideas'] as $name) {
            Tag::firstOrCreate(['name' => $name]);   // lowercase, like TagController does
        }
    }
}