<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:50']]);

        Tag::firstOrCreate(['name' => mb_strtolower(trim($data['name']))]);

        return back();
    }
}