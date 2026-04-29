<?php

use App\Http\Controllers\Api\PenghuniController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AuthController;
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
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/token', [AuthController::class, 'createToken']);
Route::get('/create_admin', [UserController::class, 'createAdmin']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Auth Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/users/datatables', [UserController::class, 'datatables']);
    Route::get('/residents/datatables', [PenghuniController::class, 'Datatable']);
    Route::get('/residents/{id}', [PenghuniController::class, 'show']);
    Route::post('/residents', [PenghuniController::class, 'store']);
    Route::put('/residents/{id}', [PenghuniController::class, 'update']);
});