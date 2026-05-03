<div style='font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 30px; max-width: 500px; margin: 0 auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);'>
    <div style='text-align: center; margin-bottom: 20px;'>
        <h2 style='color: #1e293b; margin: 0;'>Collaboration Invite</h2>
    </div>
    
    <p style='color: #475569; font-size: 15px; line-height: 1.6;'>
        Hello! You have been invited to collaborate on a private <strong>Magic Whiteboard</strong>. 
        Click the button below to join the board and start drawing together in real-time.
    </p>
    
    <div style='text-align: center; margin: 30px 0;'>
        <a href="{{ $inviteLink }}" style='background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; letter-spacing: 0.5px;'>
            Join Whiteboard
        </a>
    </div>
    
    <p style='color: #475569; font-size: 14px; line-height: 1.5;'>
        Or copy and paste this link into your browser:<br>
        <a href="{{ $inviteLink }}" style="color: #4f46e5; word-break: break-all;">{{ $inviteLink }}</a>
    </p>
    
    <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;'>
    <p style='font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;'>
        If you don't have an account yet, you will be prompted to sign up to access this private board. <br>
        If you didn't expect this invite, you can safely ignore this email.
    </p>
</div>