import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdAutoAwesome } from 'react-icons/md';
import './Auth.css'; 


const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const userBase64 = searchParams.get('user'); 
        const error = searchParams.get('error');

        if (error) {
            toast.error('Google authentication failed. Please try again.');
            navigate('/login');
            return;
        }

        if (token) {
            
            localStorage.setItem('auth_token', token);
            
            
            if (userBase64) {
                const userObj = JSON.parse(atob(userBase64));
                localStorage.setItem('user', JSON.stringify(userObj));
            }
            
            toast.success('Successfully logged in with Google!');
            
            const returnUrl = localStorage.getItem('redirect_after_login');
            if (returnUrl) {
                localStorage.removeItem('redirect_after_login');
                navigate(returnUrl); 
            } else {
                navigate('/'); 
            }
        } else {
            navigate('/login');
        }
    }, [navigate, location]);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                <div className="auth-logo" style={{ animation: 'pulse 1.5s infinite' }}>
                    <MdAutoAwesome size={32} />
                </div>
                <h2 className="auth-title">Authenticating...</h2>
                <p className="auth-subtitle">Please wait while we log you in securely.</p>
            </div>

            
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default OAuthCallback;