import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    MdAutoAwesome, 
    MdEmail, 
    MdLock, 
    MdVisibility, 
    MdVisibilityOff,
    MdSecurity // Thêm icon bảo mật
} from "react-icons/md";
import './Auth.css';
import { toast } from 'react-toastify';
import { FcGoogle } from "react-icons/fc";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State quản lý bước đăng nhập: 'login' (nhập email/pass) hoặc '2fa' (nhập mã 6 số)
    const [step, setStep] = useState('login'); 
    const [loginSessionId, setLoginSessionId] = useState('');

    useEffect(() => {
        // Đọc các tham số trên thanh URL
        const queryParams = new URLSearchParams(location.search);
        
        // Nếu Backend báo là cần nhập 2FA
        if (queryParams.get('requires_2fa') === 'true') {
            setStep('2fa'); // Chuyển sang form nhập 6 số
            setLoginSessionId(queryParams.get('session_id')); // Lưu ID lại
            toast.info("Please enter your 2FA verification code.");
        } 
        // Nếu Đăng nhập Google thất bại
        else if (queryParams.get('error') === 'Google_Auth_Failed') {
            setError("Google Authentication Failed. Please try again.");
        }
    }, [location]);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8000/api/auth/google';
    };

    // Hàm dùng chung để xử lý khi đăng nhập thành công hoàn toàn (lưu token, chuyển trang)
    const finishLogin = (data) => {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success("Welcome back!");

        const returnUrl = localStorage.getItem('redirect_after_login');
        if (returnUrl) {
            localStorage.removeItem('redirect_after_login');
            navigate(returnUrl); 
        } else {
            navigate('/');
        }
    };

    // 1. Xử lý bước Submit Email/Password
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); 

        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Kiểm tra xem backend có yêu cầu 2FA không
                if (data.status === 'requires_2fa') {
                    setStep('2fa'); // Chuyển sang giao diện nhập mã 2FA
                    setLoginSessionId(data.login_session_id); // Lưu lại ID phiên đăng nhập
                    toast.info("Please enter your 2FA verification code.");
                } else {
                    // Nếu user không bật 2FA, đăng nhập thẳng luôn
                    finishLogin(data);
                }
            } else {
                setError(data.message || 'Invalid email or password.');
            }
        } catch (err) {
            setError('Cannot connect to the server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Xử lý bước Submit Mã 6 số 2FA
    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/login/2fa-verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    login_session_id: loginSessionId,
                    otp: otp
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Nhập đúng mã 2FA -> Đăng nhập thành công
                finishLogin(data);
            } else {
                setError(data.message || 'Invalid 2FA code. Please try again.');
            }
        } catch (err) {
            setError('Cannot connect to the server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    {step === 'login' ? <MdAutoAwesome size={32} /> : <MdSecurity size={32}/>}
                </div>
                
                <h2 className="auth-title">
                    {step === 'login' ? 'Welcome back' : 'Two-Factor Authentication'}
                </h2>
                <p className="auth-subtitle">
                    {step === 'login' ? 'Start your big ideas with us' : 'Enter the 6-digit code from your authenticator app'}
                </p>

                {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                {/* --- GIAO DIỆN NHẬP EMAIL/PASSWORD --- */}
                {step === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-wrapper">
                                <MdEmail className="input-icon-left" size={20} />
                                <input 
                                    type="email" 
                                    className="form-control-pro" 
                                    placeholder="name@company.com"
                                    required
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <MdLock className="input-icon-left" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control-pro" 
                                    placeholder="••••••••" 
                                    required
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                                </button>
                            </div>
                            <div className="forgot-link-wrapper">
                                <Link to="/forgot-password" className="auth-link" style={{fontSize: '13px'}}>
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button type="submit" className="btn-auth-primary" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                )}

                {/* --- GIAO DIỆN NHẬP MÃ 2FA --- */}
                {step === '2fa' && (
                    <form onSubmit={handleVerify2FA}>
                        <div className="form-group">
                            <div className="input-wrapper" style={{ justifyContent: 'center' }}>
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    className="form-control-pro" 
                                    placeholder="000000"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Chỉ cho nhập số
                                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-auth-primary" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-auth-secondary" 
                            style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
                            onClick={() => {
                                setStep('login');
                                setError('');
                            }}
                        >
                            Back to login
                        </button>
                    </form>
                )}

                {/* Ẩn phần Login bằng Google nếu đang ở bước nhập 2FA */}
                {step === 'login' && (
                    <>
                        <div className="auth-divider">
                            <span>Or continue with</span>
                        </div>

                        <button type="button" onClick={handleGoogleLogin} className="btn-auth-google">
                            <FcGoogle size={20} />
                            <span>Google</span>
                        </button>

                        <div className="auth-footer">
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">
                                Sign up for free
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;