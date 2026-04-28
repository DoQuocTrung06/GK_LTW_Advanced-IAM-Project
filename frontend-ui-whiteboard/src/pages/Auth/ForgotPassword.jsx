import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAutoAwesome, MdArrowBack, MdCheckCircleOutline, MdEmail } from "react-icons/md";
import './Auth.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); 
  
  // THÊM: Trạng thái API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.message || 'We could not find an account with that email address.');
      }
    } catch (err) {
      setError('Cannot connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Giao diện 2: Sau khi bấm nút Gửi
  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ color: '#22c55e', marginBottom: '16px' }}>
            <MdCheckCircleOutline size={64} />
          </div>
          <h3 className="auth-title">Check your email</h3>
          <p className="auth-subtitle" style={{ marginBottom: '32px' }}>
            We've sent a password reset link to <br/><strong>{email}</strong>. 
            Please check your inbox.
          </p>
          <button className="btn-auth-primary" onClick={() => navigate('/login')}>
            Return to Sign in
          </button>
        </div>
      </div>
    );
  }

  // Giao diện 1: Form nhập email
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '460px' }}>
        <div className="auth-logo"><MdAutoAwesome size={32} /></div>
        <h3 className="auth-title">Find your account</h3>
        <p className="auth-subtitle">Enter your email address to search for your account.</p>

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