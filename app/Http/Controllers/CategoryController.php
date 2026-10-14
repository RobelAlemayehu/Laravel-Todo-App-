<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100']]);

        Category::create([
            'user_id' => $request->user()->id,
            'name'    => $data['name'],
        ]);

        return back();
    }

    public function destroy(Request $request, Category $category)
    {
        abort_unless($category->user_id === $request->user()->id, 403);
        $category->delete();

        return back();
    }
}