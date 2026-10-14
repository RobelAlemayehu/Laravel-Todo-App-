<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryApiController extends Controller
{
    public function index(Request $request)
    {
        return CategoryResource::collection(
            Category::where('user_id', $request->user()->id)
                ->withCount('todos')   // one extra query, no N+1
                ->orderBy('name')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100']]);

        $category = Category::create([
            'user_id' => $request->user()->id,
            'name'    => $data['name'],
        ]);

        return new CategoryResource($category);
    }

    public function destroy(Request $request, Category $category)
    {
        abort_unless($category->user_id === $request->user()->id, 403);
        $category->delete();   // todos keep existing, category_id becomes null

        return response()->noContent();
    }
}