<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ForgotPasswordController;

// Lấy thông tin user đang đăng nhập
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Đăng ký (Hàm này sẽ tạo User và GỬI MAIL mã OTP)
Route::post('/register', [AuthController::class, 'register']);

// Đăng nhập
Route::post('/login', [AuthController::class, 'login']);

// Xác nhận mã OTP (Hàm này sẽ kiểm tra 6 số người dùng nhập)
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

// Gửi OTP (giới hạn 5 lần / phút)
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetOtp'])
    ->middleware('throttle:5,1');
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);