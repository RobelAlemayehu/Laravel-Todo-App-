<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagApiController extends Controller
{
    public function index()
    {
        return TagResource::collection(Tag::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:50']]);

        $tag = Tag::firstOrCreate(['name' => mb_strtolower(trim($data['name']))]);

        return new TagResource($tag);
    }
}