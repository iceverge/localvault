<?php

use App\Http\Controllers\AccountController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'vault');
Route::prefix('api')->group(function () {
    Route::get('accounts', [AccountController::class, 'index']);
    Route::post('accounts', [AccountController::class, 'store']);
    Route::put('accounts/{account}', [AccountController::class, 'update']);
    Route::patch('accounts/{account}/favorite', [AccountController::class, 'favorite']);
    Route::post('accounts/{account}/reveal', [AccountController::class, 'reveal']);
    Route::delete('accounts/{account}', [AccountController::class, 'destroy']);
});
