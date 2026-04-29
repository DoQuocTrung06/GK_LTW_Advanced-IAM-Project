import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAutoAwesome, MdArrowBack, MdEmail } from "react-icons/md";
import './Auth.css';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  // Trạng thái loading và lỗi
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });

      let data = {};
      try { data = await response.json(); } catch {}

      if (response.ok) {
        toast.success("Reset code sent! Please check your email.");
        // TRUYỀN NGẦM: Đẩy sang VerifyOtp kèm biến 'flow' để phân luồng
        navigate('/verify-otp', { state: { email: email, flow: 'FORGOT_PASSWORD' } });
      } else {
        setError(data.message || 'We could not find an account with that email address.');
      }
    } catch (err) {
      setError('Cannot connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
            <MdAutoAwesome size={32} />
        </div>
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email and we'll send you an OTP to reset your password.</p>

        <form onSubmit={handleSearch}>
          {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon-left" size={20} />
              <input 
                type="email" 
                className="form-control-pro" 
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button 
              type="button" 
              className="btn-auth-primary"
              style={{ backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              <MdArrowBack size={20} /> Cancel
            </button>
            <button type="submit" className="btn-auth-primary" style={{ margin: 0 }} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;