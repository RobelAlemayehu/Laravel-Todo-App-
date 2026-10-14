<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Queries\TodoQuery;
use Illuminate\Http\Request;

class TodoApiController extends Controller
{
    public function index(Request $request)
    {
        return TodoResource::collection(
            TodoQuery::forUser($request->user(), $request->only('completed', 'category_id'))
                ->paginate(20)
        );
    }

    public function store(StoreTodoRequest $request)
    {
        $todo = $request->user()->todos()->create($request->safe()->except('tags'));
        $todo->tags()->sync($request->input('tags', []));

        return new TodoResource($todo->load('category:id,name', 'tags:id,name'));
    }

    public function update(UpdateTodoRequest $request, Todo $todo)
    {
        $this->authorize('update', $todo);

        $todo->update($request->safe()->except('tags'));
        if ($request->has('tags')) {
            $todo->tags()->sync($request->input('tags'));
        }

        return new TodoResource($todo->load('category:id,name', 'tags:id,name'));
    }

    public function destroy(Todo $todo)
    {
        $this->authorize('delete', $todo);
        $todo->delete();

        return response()->noContent();
    }
}