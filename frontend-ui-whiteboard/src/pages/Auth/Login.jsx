import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
MdAutoAwesome, // Icon mới cho cảm giác "Magic Whiteboard"
MdEmail, 
MdLock, 
MdVisibility, 
MdVisibilityOff 
} from "react-icons/md";
import './Auth.css';
import { toast } from 'react-toastify';
import { FcGoogle } from "react-icons/fc";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // THÊM HÀM NÀY: Xử lý khi bấm nút Google
    const handleGoogleLogin = () => {
        // Chuyển hướng trình duyệt sang Laravel Backend
        window.location.href = 'http://localhost:8000/api/auth/google';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // Xóa lỗi cũ trước khi gửi

        try {
            // GỌI API ĐẾN LARAVEL BACKEND
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
                // 1. Lưu Token vào LocalStorage
                localStorage.setItem('auth_token', data.token);
                // 2. Lưu thông tin user để hiển thị Avatar
                localStorage.setItem('user', JSON.stringify(data.user));
                
                toast.success("Welcome back!");

                // 3. KIỂM TRA LINK CHỜ VÀ ĐIỀU HƯỚNG
                // Lấy cái đường dẫn mà App.jsx đã lưu trước khi đá người dùng sang trang Login
                const returnUrl = localStorage.getItem('redirect_after_login');
                
                if (returnUrl) {
                    // Xóa đường dẫn đó đi để những lần đăng nhập sau không bị dính lại
                    localStorage.removeItem('redirect_after_login');
                    // Chuyển người dùng chui tọt vào thẳng cái phòng họ đang muốn vào (VD: /board/14)
                    navigate(returnUrl); 
                } else {
                    // Nếu không có phòng chờ (họ tự bấm nút Login ở trang chủ), thì cho về trang gốc
                    navigate('/');
                }

            } else {
                // Backend trả về lỗi (sai mật khẩu, email không tồn tại...)
                setError(data.message || 'Invalid email or password.');
            }
        } catch (err) {
            // Lỗi sập server hoặc mất mạng
            setError('Cannot connect to the server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
        <div className="auth-card">
            {/* Logo sáng tạo hơn */}
            <div className="auth-logo">
            <MdAutoAwesome size={32} />
            </div>
            
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Start your big ideas with us</p>

            <form onSubmit={handleLogin}>
            {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
            {/* Email Group */}
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

            {/* Password Group */}
            <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                <MdLock className="input-icon-left" size={20} />
                <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control-pro" 
                    placeholder="••••••••" /* Đã thêm lại placeholder bị thiếu */
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
        </div>
        </div>
    );
}

export default Login;