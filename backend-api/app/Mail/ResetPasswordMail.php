<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public String $otpCode;

    
    public function __construct(String $otp)
    {
        $this->otpCode = $otp;
    }

    
    public function build()
    {
        return $this->subject('Magic Whiteboard - Password Reset Code')
                    ->html("
                        <div style='font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 30px; max-width: 500px; margin: 0 auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);'>
                            <div style='text-align: center; margin-bottom: 20px;'>
                                <h2 style='color: #1e293b; margin: 0;'>Reset Your Password</h2>
                            </div>
                            <p style='color: #475569; font-size: 15px; line-height: 1.6;'>We received a request to reset the password for your Magic Whiteboard account. Your password reset code is:</p>
                            
                            <div style='text-align: center; margin: 30px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;'>
                                <h1 style='color: #4f46e5; font-size: 38px; letter-spacing: 8px; margin: 0;'>{$this->otpCode}</h1>
                            </div>
                            
                            <p style='color: #475569; font-size: 15px;'>This code will expire in <strong>5 minutes</strong>.</p>
                            
                            <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;'>
                            <p style='font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;'>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                        </div>
                    ");
    }
}