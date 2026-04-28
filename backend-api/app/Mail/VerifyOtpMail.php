<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public String $otpCode; // Biến lưu mã OTP

    /**
     * Create a new message instance.
     */
    public function __construct(String $otp)
    {
        $this->otpCode = $otp; // Gán giá trị mã OTP khi khởi tạo
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Magic Whiteboard - Verification Code') // Tiêu đề email
                    ->html("
                        <div style='font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;'>
                            <h2>Verify Your Account</h2>
                            <p>Thank you for signing up! Your verification code is:</p>
                            <h1 style='color: #4A90E2;'>{$this->otpCode}</h1>
                            <p>This code will expire in <strong>5 minutes</strong>.</p>
                            <hr>
                            <p style='font-size: 12px; color: #888;'>If you didn't request this, please ignore this email.</p>
                        </div>
                    "); // Nội dung email định dạng HTML
    }
}