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
    
    public function sendResetOtp(Request $request)
    {
        
        $request->validate([
            'email' => 'required|email'
        ]);

        
        $user = User::where('email', $request->email)->first();

       
        if (!$user) {
            return response()->json([
                'message' => 'If the email exists, a reset code has been sent.'
            ]);
        }

        
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        
        $hashedOtp = Hash::make($otp);

        
        Cache::put(
            'password_reset_otp_' . $user->email,
            $hashedOtp,
            now()->addMinutes(5)
        );

        try {
            
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

    
    public function resetPassword(Request $request)
    {
        
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        
        $cachedOtp = Cache::get('password_reset_otp_' . $request->email);

        
        if (!$cachedOtp || !Hash::check($request->otp, $cachedOtp)) {
            return response()->json([
                'message' => 'Invalid or expired reset code.'
            ], 400);
        }

        
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

       
        $user->password = Hash::make($request->password);
        $user->save();

       
        Cache::forget('password_reset_otp_' . $request->email);

        return response()->json([
            'message' => 'Password has been reset successfully.'
        ]);
    }
}