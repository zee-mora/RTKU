<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('', function () {
    return response()->json([
        'message' => 'Welcome to the RTKU API',
    ], 200);
});
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/create-admin', [UserController::class, 'createAdmin']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Auth Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/user', [UserController::class, 'getUser']);
});