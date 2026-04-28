import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MdAutoAwesome, 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff 
} from "react-icons/md";
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Trạng thái cho Form Validation (Lỗi ở Frontend)
  const [formError, setFormError] = useState(''); 
  
  // THÊM: Trạng thái cho API (Loading và Lỗi từ Backend)
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(''); 
    setApiError('');

    if (!validatePassword(formData.password)) {
      setFormError("Password must be at least 8 characters, include uppercase, lowercase, and number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match!");
      return;
    }

    // Bắt đầu gọi API
    setIsLoading(true);
    try {
      // 1. Dùng axios.post để gửi dữ liệu đăng ký
      const response = await axios.post('http://localhost:8000/api/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword
      });

      // 2. QUAN TRỌNG: Nếu đăng ký thành công (Laravel đã gửi mail OTP ngầm)
      if (response.status === 201 || response.status === 200) {
        // Chuyển sang trang nhập OTP và "đèo" theo cái email người dùng vừa nhập
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    } catch (err) {
      // Axios trả về lỗi trong err.response.data
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo"><MdAutoAwesome size={32} /></div>
        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Join us to visualize your ideas</p>

        <form onSubmit={handleRegister}>
          {/* Hiển thị lỗi Frontend hoặc Backend */}
          {(formError || apiError) && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              {formError || apiError}
            </div>
          )}

          {/* Name Group */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <MdPerson className="input-icon-left" size={20} />
              <input 
                type="text" 
                className="form-control-pro" 
                placeholder="John Doe"
                required
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

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
                placeholder="••••••••"
                required
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <MdLock className="input-icon-left" size={20} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className="form-control-pro" 
                placeholder="••••••••"
                required
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-primary" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;