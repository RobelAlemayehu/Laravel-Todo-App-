<?php

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\TagApiController;
use App\Http\Controllers\Api\TodoApiController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::post('/login', [AuthApiController::class, 'login']);
Route::post('/register', [AuthApiController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout']);
    Route::get('/user', fn (Request $request) => $request->user()->only('id', 'name', 'email'));

    Route::apiResource('todos', TodoApiController::class)->except(['show']);
    Route::apiResource('categories', CategoryApiController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('tags', TagApiController::class)->only(['index', 'store']);
});