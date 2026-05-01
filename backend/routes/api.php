<?php

use App\Http\Controllers\Api\PenghuniController;
use App\Http\Controllers\Api\RumahController;
use App\Http\Controllers\Api\PaymentsController;
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
    
    // Dashboard
    Route::get('/dashboard/statistics', [\App\Http\Controllers\Api\DashboardController::class, 'statistics']);
    Route::get('/dashboard/monthly-overview', [\App\Http\Controllers\Api\DashboardController::class, 'monthlyOverview']);
    Route::get('/dashboard/income-expense', [\App\Http\Controllers\Api\DashboardController::class, 'incomeExpenseSummary']);
    Route::post('/dashboard/generate-charges', [\App\Http\Controllers\Api\DashboardController::class, 'generateMonthlyCharges']);
    
    Route::get('/users/datatables', [UserController::class, 'datatables']);
    Route::get('/residents/options', [PenghuniController::class, 'options']);
    Route::get('/residents/datatables', [PenghuniController::class, 'Datatable']);
    Route::get('/residents/{id}', [PenghuniController::class, 'show']);
    Route::post('/residents', [PenghuniController::class, 'store']);
    Route::put('/residents/{id}', [PenghuniController::class, 'update']);
    Route::delete('/residents/{id}', [PenghuniController::class, 'destroy']);

    Route::get('/houses/datatables', [RumahController::class, 'datatable']);
    Route::get('/houses/{id}', [RumahController::class, 'show']);
    Route::post('/houses', [RumahController::class, 'store']);
    Route::put('/houses/{id}', [RumahController::class, 'update']);

    // Payments
    Route::get('/payments/options', [PaymentsController::class, 'options']);
    Route::get('/payments/datatables', [PaymentsController::class, 'datatable']);
    Route::post('/payments', [PaymentsController::class, 'store']);
    Route::put('/payments/{id}', [PaymentsController::class, 'update']);
    Route::delete('/payments/{id}', [PaymentsController::class, 'destroy']);

    // Expenses
    Route::get('/expenses/categories', [\App\Http\Controllers\Api\ExpensesController::class, 'categories']);
    Route::get('/expenses/datatables', [\App\Http\Controllers\Api\ExpensesController::class, 'datatable']);
    Route::get('/expenses/summary', [\App\Http\Controllers\Api\ExpensesController::class, 'monthlySummary']);
    Route::get('/expenses/{id}', [\App\Http\Controllers\Api\ExpensesController::class, 'show']);
    Route::post('/expenses', [\App\Http\Controllers\Api\ExpensesController::class, 'store']);
    Route::put('/expenses/{id}', [\App\Http\Controllers\Api\ExpensesController::class, 'update']);
    Route::delete('/expenses/{id}', [\App\Http\Controllers\Api\ExpensesController::class, 'destroy']);

    // Reports
    Route::get('/reports/finance/summary', [PaymentsController::class, 'reportSummary']);
    Route::get('/reports/finance/detail', [PaymentsController::class, 'reportDetail']);
});