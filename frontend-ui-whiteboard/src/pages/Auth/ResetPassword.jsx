import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdAutoAwesome, 
  MdVisibility, 
  MdVisibilityOff, 
  MdLock, 
  MdCheckCircleOutline
} from "react-icons/md";
import './Auth.css';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy email và otp từ state ẩn do trang VerifyOtp truyền sang
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [formData, setFormData] = useState({ 
    password: '', 
    confirmPassword: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Kiểm tra tính hợp lệ của mật khẩu
  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };
  
  // BẢO VỆ: Nếu ai đó cố tình vào thẳng link này mà không qua OTP, đá về trang forgot
  if (!email || !otp) {
      navigate('/forgot-password');
      return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    setApiError('');

    if (!validatePassword(formData.password)) {
      newErrors.password = "Must be at least 8 characters, with uppercase and number.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      try {
        const response = await fetch('http://localhost:8000/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: email, // Lấy ngầm
            otp: otp,     // Lấy ngầm từ VerifyOtp truyền sang
            password: formData.password,
            password_confirmation: formData.confirmPassword 
          })
        });

        const data = await response.json();

        if (response.ok) {
          setIsSuccess(true);
          // Tự động nhảy về trang Login sau 3 giây
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        } else {
          setApiError(data.message || 'Invalid or expired session. Please try again.');
        }
      } catch (err) {
        setApiError('Cannot connect to the server.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ color: '#22c55e', marginBottom: '16px' }}><MdCheckCircleOutline size={64} /></div>
          <h3 className="auth-title">Password Updated!</h3>
          <p className="auth-subtitle" style={{ marginBottom: '32px' }}>
            Your password has been changed successfully. <br/>
            You will be redirected to the login page shortly...
          </p>
          <button className="btn-auth-primary" onClick={() => navigate('/login', { replace: true })}>
            Go to Sign in now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo"><MdAutoAwesome size={32}  /></div>
        <h3 className="auth-title">Create New Password</h3>
        <p className="auth-subtitle">Please choose a strong password for your account</p>

        <form onSubmit={handleSubmit}>
          {apiError && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{apiError}</div>}

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-wrapper">
              <MdLock className="input-icon-left" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                className="form-control-pro"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
            {errors.password && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <MdLock className="input-icon-left" size={20} />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                className="form-control-pro"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn-auth-primary" 
            disabled={isLoading || !formData.password || !formData.confirmPassword}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={() => navigate('/login', { replace: true })} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            Cancel and back to Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;