import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    MdAutoAwesome, 
    MdEmail, 
    MdLock, 
    MdVisibility, 
    MdVisibilityOff,
    MdSecurity 
} from "react-icons/md";
import './Auth.css';
import { toast } from 'react-toastify';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    
    
    const [step, setStep] = useState('login'); 
    const [loginSessionId, setLoginSessionId] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        
        if (queryParams.get('requires_2fa') === 'true') {
            setStep('2fa'); 
            setLoginSessionId(queryParams.get('session_id')); 
            toast.info("Please enter your 2FA verification code.");
        } 
        
        else if (queryParams.get('error') === 'Google_Auth_Failed') {
            setError("Google Authentication Failed. Please try again.");
        }
        else if (queryParams.get('error') === 'Github_Auth_Failed') {
            setError("GitHub Authentication Failed. Please try again.");
        }
    }, [location]);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGithubLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };

    
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

    
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); 

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                
                if (data.status === 'requires_2fa') {
                    setStep('2fa'); 
                    setLoginSessionId(data.login_session_id); 
                    toast.info("Please enter your 2FA verification code.");
                } else {
                    
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login/2fa-verify`, {
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
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
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

               
                {step === 'login' && (
                    <>
                        <div className="auth-divider">
                            <span>Or continue with</span>
                        </div>

                        <button type="button" onClick={handleGoogleLogin} className="btn-auth-google">
                            <FcGoogle size={20} />
                            <span>Google</span>
                        </button>

                        
                        <button 
                            type="button" 
                            onClick={handleGithubLogin} 
                            className="btn-auth-google" 
                            style={{ marginTop: '10px', background: '#24292e', color: 'white' }}
                        >
                            <FaGithub size={20} />
                            <span>GitHub</span>
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