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

function Login() {
const navigate = useNavigate();
const [formData, setFormData] = useState({ email: '', password: '' });
const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Xóa lỗi cũ trước khi gửi

    try {
    // GỌI API ĐẾN LARAVEL BACKEND (Thay URL bằng link API thật của bạn)
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
        // 1. Lưu Token (Sanctum/JWT) vào LocalStorage
        localStorage.setItem('auth_token', data.token);
        // 2. Lưu thông tin user (để hiển thị Avatar ở Whiteboard)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 3. Chuyển hướng về trang Whiteboard
        navigate('/');
    } else {
        // Backend trả về lỗi (sai pass, email ko tồn tại...)
        setError(data.message || 'Invalid email or password.');
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
            <Link to="/forgot-password" size={20} className="auth-link" style={{fontSize: '13px'}}>
                Forgot password?
            </Link>
            </div>
        </div>

        <button type="submit" className="btn-auth-primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        </form>

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