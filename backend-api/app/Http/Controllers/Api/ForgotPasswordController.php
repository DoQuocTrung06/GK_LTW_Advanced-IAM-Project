<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use App\Mail\ResetPasswordMail;

class ForgotPasswordController extends Controller
{
    /**
     * 1. Send OTP to user's email
     */
    public function sendResetOtp(Request $request)
    {
        // Validate email đầu vào
        $request->validate([
            'email' => 'required|email'
        ]);

        // Tìm user theo email
        $user = User::where('email', $request->email)->first();

        // ⚠️ Không trả về "email không tồn tại" để tránh lộ thông tin
        if (!$user) {
            return response()->json([
                'message' => 'If the email exists, a reset code has been sent.'
            ]);
        }

        // Tạo OTP 6 số (đảm bảo luôn đủ 6 chữ số)
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // 🔐 Hash OTP trước khi lưu (tránh bị lộ)
        $hashedOtp = Hash::make($otp);

        // Lưu vào cache trong 5 phút
        Cache::put(
            'password_reset_otp_' . $user->email,
            $hashedOtp,
            now()->addMinutes(5)
        );

        try {
            // Gửi email chứa OTP
           Mail::to($user->email)->send(new ResetPasswordMail($otp));

            return response()->json([
                'message' => 'Reset code sent! Please check your email.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email.'
            ], 500);
        }
    }

    /**
     * 2. Verify OTP and reset password
     */
    public function resetPassword(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Lấy OTP đã lưu trong cache
        $cachedOtp = Cache::get('password_reset_otp_' . $request->email);

        // ❌ Nếu không có OTP hoặc OTP sai
        if (!$cachedOtp || !Hash::check($request->otp, $cachedOtp)) {
            return response()->json([
                'message' => 'Invalid or expired reset code.'
            ], 400);
        }

        // Tìm user
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        // 🔐 Cập nhật password mới (hash)
        $user->password = Hash::make($request->password);
        $user->save();

        // 🧹 Xóa OTP sau khi dùng
        Cache::forget('password_reset_otp_' . $request->email);

        return response()->json([
            'message' => 'Password has been reset successfully.'
        ]);
    }
}