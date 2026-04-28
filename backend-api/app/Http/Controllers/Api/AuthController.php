<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Mail\VerifyOtpMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon; // Thư viện xử lý thời gian

class AuthController extends Controller
{
    /**
     * Handle user registration and send OTP
     */
    public function register(Request $request)
    {
        // Kiểm tra đầu vào
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Tạo mã số ngẫu nhiên 6 chữ số
        $generatedOtp = rand(100000, 999999);

        // Lưu thông tin người dùng vào Database
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'otp' => $generatedOtp,
            'otp_expires_at' => Carbon::now()->addMinutes(5), // Hết hạn sau 5 phút
        ]);

        // Gửi Mail chứa mã OTP
        try {
            Mail::to($user->email)->send(new VerifyOtpMail($generatedOtp));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Email service error'], 500); // Lỗi gửi mail
        }

        return response()->json([
            'message' => 'OTP sent successfully to your email.',
            'email' => $user->email
        ], 201);
    }

    /**
     * Verify the OTP provided by the user
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        // Tìm User có email và mã OTP khớp, và mã đó phải còn hạn
        $user = User::where('email', $request->email)
                    ->where('otp', $request->otp)
                    ->where('otp_expires_at', '>', Carbon::now())
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 400);
        }

        // Nếu khớp: Xóa OTP cũ và đánh dấu đã xác thực thành công
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->email_verified_at = Carbon::now(); // Cập nhật cột xác thực của Laravel
        $user->save();

        // Cấp Token để người dùng đăng nhập ngay lập tức
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account verified successfully!',
            'token' => $token,
            'user' => $user
        ], 200);
    }
}