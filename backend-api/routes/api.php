<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\BoardController; // Import BoardController mới
use App\Events\DrawAction;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Public Routes (Không cần đăng nhập)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetOtp'])->middleware('throttle:5,1');
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);


/*
|--------------------------------------------------------------------------
| Private Routes (Bắt buộc phải có Token - Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Lấy thông tin user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // API cho tính năng Share & Visibility
    Route::post('/boards/{boardId}/invite', [BoardController::class, 'invite']);
    Route::put('/boards/{boardId}/visibility', [BoardController::class, 'updateVisibility']);
    // Route khởi tạo hoặc lấy thông tin bảng vẽ (dấu ? nghĩa là biến id có thể có hoặc không)
    Route::get('/boards/init/{id?}', [BoardController::class, 'getOrCreateBoard']);

    // Route nhận dữ liệu nét vẽ và chuyển cho BoardController xử lý
    Route::post('/boards/{board}/broadcast-draw', [BoardController::class, 'broadcastDraw']);
    Route::put('/boards/{boardId}/save-data', [BoardController::class, 'saveBoardData']);

});

// Cổng xác thực cho WebSocket Reverb
Broadcast::routes(['middleware' => ['auth:sanctum']]);