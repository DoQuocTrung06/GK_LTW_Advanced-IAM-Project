<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\BoardController;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetOtp'])->middleware('throttle:5,1');
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

// MỚI: Route cho Google Login
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::get('/auth/github', [AuthController::class, 'redirectToGithub']);
Route::get('/auth/github/callback', [AuthController::class, 'handleGithubCallback']);

/*
|--------------------------------------------------------------------------
| Private Routes (ĐỔI 'auth:sanctum' THÀNH 'auth:api' ĐỂ DÙNG JWT)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {
    
    // Đăng xuất (Cần có token mới đăng xuất được)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/2fa/generate', [AuthController::class, 'generate2FA']);
    Route::post('/user/2fa/verify', [AuthController::class, 'verifyAndEnable2FA']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/boards/{boardId}/invite', [BoardController::class, 'invite']);
    Route::put('/boards/{boardId}/visibility', [BoardController::class, 'updateVisibility']);
    Route::get('/boards/init/{id?}', [BoardController::class, 'getOrCreateBoard']);
    Route::post('/boards/{board}/broadcast-draw', [BoardController::class, 'broadcastDraw']);
    Route::put('/boards/{boardId}/save-data', [BoardController::class, 'saveBoardData']);
});

// Cổng xác thực cho WebSocket Reverb cũng đổi sang JWT
Broadcast::routes(['middleware' => ['auth:api']]);

Route::post('/login/2fa-verify', [App\Http\Controllers\Api\AuthController::class, 'verify2FALogin']);


