<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\TodoResource;
use App\Models\Category;
use App\Models\Todo;
use App\Queries\TodoQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Resources\TagResource;
use App\Models\Tag;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Todos/Index', [
            'todos' => TodoResource::collection(
                TodoQuery::forUser($user, $request->only('completed', 'category_id'))
                    ->paginate(20)
                    ->withQueryString()
            ),
            'categories' => CategoryResource::collection(
                Category::where('user_id', $user->id)->withCount('todos')->orderBy('name')->get()
            ),
            'tags'    => TagResource::collection(Tag::orderBy('name')->get()),
            'filters' => $request->only('completed', 'category_id'),
        ]);
    }
    public function store(StoreTodoRequest $request)
    {
        $todo = $request->user()->todos()->create($request->safe()->except('tags'));
        $todo->tags()->sync($request->input('tags', []));

        return back();
    }

    public function update(UpdateTodoRequest $request, Todo $todo)
    {
        $this->authorize('update', $todo);

        $todo->update($request->safe()->except('tags'));
        if ($request->has('tags')) {
            $todo->tags()->sync($request->input('tags'));
        }

        return back();
    }

    public function destroy(Todo $todo)
    {
        $this->authorize('delete', $todo);
        $todo->delete();

        return back();
    }

    
    
}