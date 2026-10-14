<?php

namespace App\Policies;

use App\Models\Todo;
use App\Models\User;

class TodoPolicy
{
    public function update(User $user, Todo $todo): bool
    {
        return $todo->user_id === $user->id;
    }

    public function delete(User $user, Todo $todo): bool
    {
        return $todo->user_id === $user->id;
    }
}