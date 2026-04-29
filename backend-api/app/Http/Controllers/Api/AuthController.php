<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Mail\VerifyOtpMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache; // Quan trọng: Thư viện Cache

class AuthController extends Controller
{
    /**
     * Handle user registration and send OTP (Lưu vào Cache, chưa lưu DB)
     */
    public function register(Request $request)
    {
        // 1. Kiểm tra đầu vào (Vẫn check unique để đảm bảo email chưa có ai dùng)
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // 2. Tạo mã số ngẫu nhiên 6 chữ số
        $generatedOtp = (string) rand(100000, 999999);

        // 3. Gom thông tin đăng ký vào một mảng tạm thời
        $pendingUser = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Phải mã hóa mật khẩu luôn
            'otp' => $generatedOtp,
        ];

        // 4. Lưu mảng này vào CACHE trong đúng 5 phút (Cho khớp với nội dung Email)
        // Khóa lưu trữ sẽ có dạng: pending_user_nguyenvana@gmail.com
        Cache::put('pending_user_' . $request->email, $pendingUser, Carbon::now()->addMinutes(1));

        // 5. Gửi Mail chứa mã OTP
        try {
            Mail::to($request->email)->send(new VerifyOtpMail($generatedOtp));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Email service error'], 500); 
        }

        return response()->json([
            'message' => 'OTP sent successfully to your email.',
            'email' => $request->email
        ], 201);
    }

    /**
     * Verify the OTP provided by the user (Kiểm tra Cache, nếu đúng mới lưu DB)
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $resetOtp = Cache::get('password_reset_otp_' . $request->email);
        if ($resetOtp) {
            // Kiểm tra mã OTP (Vì bên ForgotPasswordController đã Hash OTP nên ở đây phải dùng Hash::check)
            if (!Hash::check($request->otp, $resetOtp)) {
                return response()->json(['message' => 'Incorrect OTP code.'], 400);
            }

            // CHỈ KIỂM TRA, TUYỆT ĐỐI KHÔNG XÓA CACHE. 
            // Giữ nguyên Cache để lát nữa sang trang ResetPassword còn có cái để check lại.
            return response()->json([
                'message' => 'OTP verified. You can now reset your password.'
            ], 200);
        }
        
        // 1. Lấy thông tin user tạm thời từ Cache ra
        $pendingUser = Cache::get('pending_user_' . $request->email);

        // Nếu Cache trống (quá 5 phút bị xóa, hoặc gõ sai email)
        if (!$pendingUser) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 400);
        }

        // 2. Kiểm tra xem mã OTP có khớp không
        if ($pendingUser['otp'] !== $request->otp) {
            return response()->json(['message' => 'Incorrect OTP code.'], 400);
        }

        // 3. NẾU MỌI THỨ KHỚP: Bây giờ mới CHÍNH THỨC lưu vào Database thật
        $user = User::create([
            'name' => $pendingUser['name'],
            'email' => $pendingUser['email'],
            'password' => $pendingUser['password'], // Lấy mật khẩu đã mã hóa từ Cache
            'email_verified_at' => Carbon::now(),   // Đánh dấu đã xác thực luôn
        ]);

        // 4. Dọn dẹp rác: Xóa Cache đi vì người này đã đăng ký xong rồi
        Cache::forget('pending_user_' . $request->email);

        // 5. Cấp Token để người dùng đăng nhập ngay lập tức
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account verified successfully!',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    /**
     * Handle user login
     */
    public function login(Request $request)
    {
        // 1. Kiểm tra dữ liệu đầu vào (Validate input)
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // 2. Tìm user trong database theo email
        $user = User::where('email', $request->email)->first();

        // 3. Kiểm tra user có tồn tại không VÀ mật khẩu có khớp không
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401); // 401: Unauthorized
        }

        // 4. Tạo token mới cho phiên đăng nhập
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Trả về token và thông tin user
        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        // Xóa token hiện tại đang được sử dụng bởi user
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.'
        ], 200);
    }


    /**
     * Handle resending OTP (Dành cho cơ chế Cache)
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // 1. Kiểm tra xem người dùng đã có trong Database thật chưa
        if (User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'Account is already verified.'], 400);
        }

        // 2. Lấy thông tin đăng ký tạm thời từ Cache
        $pendingUser = Cache::get('pending_user_' . $request->email);

        // 3. Nếu Cache trống (do người dùng để quá 1 phút mới bấm gửi lại) -> Bắt đăng ký lại từ đầu
        if (!$pendingUser) {
            return response()->json([
                'message' => 'Session expired. Please register again.'
            ], 400);
        }

        // 4. Nếu Cache vẫn còn: Tạo mã OTP mới
        $newOtp = (string) rand(100000, 999999);
        $pendingUser['otp'] = $newOtp;

        // 5. Ghi đè lại Cache và gia hạn thêm 1 phút nữa
        Cache::put('pending_user_' . $request->email, $pendingUser, Carbon::now()->addMinutes(1));

        // 6. Gửi lại Email
        try {
            Mail::to($request->email)->send(new VerifyOtpMail($newOtp));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Email service error'], 500);
        }

        return response()->json([
            'message' => 'A new OTP has been sent to your email.'
        ], 200);
    }
}