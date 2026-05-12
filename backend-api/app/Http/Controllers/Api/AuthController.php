<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Mail\VerifyOtpMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache; 
use Tymon\JWTAuth\Facades\JWTAuth; 
use Laravel\Socialite\Facades\Socialite; 
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;


class AuthController extends Controller
{
    
    public function register(Request $request)
    {
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        
        $generatedOtp = (string) rand(100000, 999999);

        
        $pendingUser = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'otp' => $generatedOtp,
        ];

       
       
        Cache::put('pending_user_' . $request->email, $pendingUser, Carbon::now()->addMinutes(1));

        
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

    
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $resetOtp = Cache::get('password_reset_otp_' . $request->email);
        if ($resetOtp) {
           
            if (!Hash::check($request->otp, $resetOtp)) {
                return response()->json(['message' => 'Incorrect OTP code.'], 400);
            }

            
            return response()->json([
                'message' => 'OTP verified. You can now reset your password.'
            ], 200);
        }
        
        
        $pendingUser = Cache::get('pending_user_' . $request->email);

       
        if (!$pendingUser) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 400);
        }

        
        if ($pendingUser['otp'] !== $request->otp) {
            return response()->json(['message' => 'Incorrect OTP code.'], 400);
        }

        
        $user = User::create([
            'name' => $pendingUser['name'],
            'email' => $pendingUser['email'],
            'password' => $pendingUser['password'], 
            'email_verified_at' => Carbon::now(),   
        ]);

        
        Cache::forget('pending_user_' . $request->email);

        
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Account verified successfully!',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

       
        if (! Auth::guard('api')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        $user = Auth::guard('api')->user();

       
        if ($user->two_factor_enabled) {
            $loginSessionId = (string) \Illuminate\Support\Str::uuid();
            
            
            Cache::put('2fa_login_' . $loginSessionId, $user->id, Carbon::now()->addMinutes(5));

           
            Auth::guard('api')->logout();

            return response()->json([
                'status' => 'requires_2fa',
                'message' => '2FA verification required.',
                'login_session_id' => $loginSessionId 
            ], 200);
        }

       
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    
    public function logout()
    {
        
        Auth::guard('api')->logout();

        return response()->json(['message' => 'Logged out successfully.'], 200);
    }

    

    public function redirectToGoogle()
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
        $driver = Socialite::driver('google');
        return $driver->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->stateless()->user();

            
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'password' => null, 
                    'email_verified_at' => Carbon::now(),
                ]
            );

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

           
            if ($user->two_factor_enabled) {
                
                $loginSessionId = (string) \Illuminate\Support\Str::uuid();
                
               
                Cache::put('2fa_login_' . $loginSessionId, $user->id, Carbon::now()->addMinutes(5));

                
                return redirect()->away($frontendUrl . '/login?requires_2fa=true&session_id=' . $loginSessionId);
            }
           

            
            $token = JWTAuth::fromUser($user);
            $userData = base64_encode(json_encode($user));

            return redirect()->away($frontendUrl . '/oauth/callback?token=' . $token . '&user=' . $userData);

        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/login?error=Google_Auth_Failed');
        }
    }

    
    public function redirectToGithub()
    {
        /** @var \Laravel\Socialite\Two\GithubProvider $driver */
        $driver = Socialite::driver('github');
        return $driver->stateless()->redirect();
    }

    public function handleGithubCallback()
    {
        try {
            /** @var \Laravel\Socialite\Two\GithubProvider $driver */
            $driver = Socialite::driver('github');
            $githubUser = $driver->stateless()->user();

            
            $user = User::updateOrCreate(
                ['email' => $githubUser->getEmail()],
                [
                    
                    'name' => $githubUser->getName() ?? $githubUser->getNickname(), 
                    'password' => null, 
                    'email_verified_at' => Carbon::now(),
                ]
            );

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

            
            if ($user->two_factor_enabled) {
                $loginSessionId = (string) \Illuminate\Support\Str::uuid();
                Cache::put('2fa_login_' . $loginSessionId, $user->id, Carbon::now()->addMinutes(5));
                return redirect()->away($frontendUrl . '/login?requires_2fa=true&session_id=' . $loginSessionId);
            }

            
            $token = JWTAuth::fromUser($user);
            $userData = base64_encode(json_encode($user));

            return redirect()->away($frontendUrl . '/oauth/callback?token=' . $token . '&user=' . $userData);

        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/login?error=Github_Auth_Failed');
        }
    }


    
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        if (User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'Account is already verified.'], 400);
        }

        $pendingUser = Cache::get('pending_user_' . $request->email);

        if (!$pendingUser) {
            return response()->json([
                'message' => 'Session expired. Please register again.'
            ], 400);
        }

       
        $newOtp = (string) rand(100000, 999999);
        $pendingUser['otp'] = $newOtp;

       
        Cache::put('pending_user_' . $request->email, $pendingUser, Carbon::now()->addMinutes(1));

        
        try {
            Mail::to($request->email)->send(new VerifyOtpMail($newOtp));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Email service error'], 500);
        }

        return response()->json([
            'message' => 'A new OTP has been sent to your email.'
        ], 200);
    }

    
    public function generate2FA(Request $request)
    {
        $user = $request->user();
        $google2fa = new Google2FA();

        
        if (!$user->two_factor_secret) {
            $user->two_factor_secret = $google2fa->generateSecretKey();
            $user->save();
        }

        
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            'Magic Whiteboard', 
            $user->email,
            $user->two_factor_secret
        );

        
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        
       
        $svg = $writer->writeString($qrCodeUrl);

        
        return response()->json([
            'secret' => $user->two_factor_secret,
            'qr_code_svg' => $svg
        ], 200);
    }

    
    public function verifyAndEnable2FA(Request $request)
    {
        
        $request->validate([
            'otp' => 'required|string|size:6'
        ]);

        $user = $request->user();

        
        if (!$user->two_factor_secret) {
            return response()->json(['message' => '2FA is not set up yet.'], 400);
        }

        
        $google2fa = new Google2FA();
        $isValid = $google2fa->verifyKey($user->two_factor_secret, $request->otp);

        if ($isValid) {
            
            $user->two_factor_enabled = true;
            $user->save();

            return response()->json(['message' => '2FA enabled successfully!'], 200);
        }

        
        return response()->json(['message' => 'Invalid OTP code. Try again.'], 400);
    }

   
    public function verify2FALogin(Request $request)
    {
        $request->validate([
            'login_session_id' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        
        $userId = Cache::get('2fa_login_' . $request->login_session_id);

        if (!$userId) {
            return response()->json(['message' => 'Login session expired. Please login again.'], 400);
        }

        $user = User::find($userId);

        if (!$user || !$user->two_factor_secret) {
            return response()->json(['message' => 'Invalid user or 2FA not set up.'], 400);
        }

        
        $google2fa = new Google2FA();
        $isValid = $google2fa->verifyKey($user->two_factor_secret, $request->otp);

        if ($isValid) {
            
            Cache::forget('2fa_login_' . $request->login_session_id);
            
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'status' => 'success',
                'message' => '2FA verified. Login successful.',
                'token' => $token,
                'user' => $user
            ], 200);
        }

       
        return response()->json(['message' => 'Invalid 2FA code. Please try again.'], 400);
    }
}