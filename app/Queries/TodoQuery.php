<?php

namespace App\Queries;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class TodoQuery
{
    public static function forUser(User $user, array $filters = []): Builder
    {
        return Todo::query()
            ->where('user_id', $user->id)
            ->with(['category:id,name', 'tags:id,name'])
            ->when(isset($filters['completed']), fn ($q) =>
                $q->where('is_completed', filter_var($filters['completed'], FILTER_VALIDATE_BOOLEAN)))
            ->when($filters['category_id'] ?? null, fn ($q, $id) =>
                $q->where('category_id', $id))
            ->latest();
    }
}