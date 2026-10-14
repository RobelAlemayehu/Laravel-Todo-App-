<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TodoQueryCountTest extends TestCase
{
    use RefreshDatabase;

    private function seedTodos(User $user, int $count): void
    {
        $category = Category::factory()->create(['user_id' => $user->id]);
        $tags = Tag::factory()->count(3)->create();

        Todo::factory()
            ->count($count)
            ->create(['user_id' => $user->id, 'category_id' => $category->id])
            ->each(fn ($todo) => $todo->tags()->attach($tags->pluck('id')));
    }

    private function countQueries(callable $fn): int
    {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $fn();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $count;
    }

    public function test_api_index_query_count_does_not_grow_with_rows(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->seedTodos($user, 2);
        $small = $this->countQueries(fn () => $this->getJson('/api/todos')->assertOk());

        $this->seedTodos($user, 18);
        $large = $this->countQueries(fn () => $this->getJson('/api/todos')->assertOk());

        $this->assertSame(
            $small,
            $large,
            "N+1 detected: {$small} queries for 2 todos, {$large} for 20."
        );
    }

    public function test_web_index_query_count_does_not_grow_with_rows(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->seedTodos($user, 2);
        $small = $this->countQueries(fn () => $this->get('/todos', ['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest'])->assertOk());

        $this->seedTodos($user, 18);
        $large = $this->countQueries(fn () => $this->get('/todos', ['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest'])->assertOk());

        $this->assertSame($small, $large, "N+1 on web page: {$small} queries for 2 todos, {$large} for 20.");
    }
}