import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MdVpnKey, MdEmail, MdAutoAwesome } from "react-icons/md";
import './Auth.css'; // Sử dụng chung file CSS để đồng bộ giao diện
import { toast } from 'react-toastify';

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy email từ trang Register truyền sang thông qua state của router
  const email = location.state?.email || ''; 

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);

    try {
      // Gọi API xác nhận mã OTP đã viết ở Backend
      const response = await axios.post('http://localhost:8000/api/verify-otp', {
        email: email,
        otp: otp
      });

      if (response.status === 200) {
        // Nếu xác thực thành công, lưu Token và chuyển về trang Dashboard/Whiteboard
        toast.success('Verification successful! Redirecting...');
        setTimeout(() => {
            navigate('/login');
        }, 2000); 
      }
    } catch (err) {
      // Hiển thị lỗi nếu mã OTP sai hoặc hết hạn
      toast.error(err.response?.data?.message || 'The OTP code is incorrect!');
    } finally {
      setIsLoading(false);
    }
  };

    // 1. Tạo hàm xử lý gửi lại mã
    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            // Gọi lại đúng cái API Register nhưng Backend sẽ hiểu là gửi lại mã
            await axios.post('http://localhost:8000/api/register', {
                email: email,
                // Gửi lại các thông tin cần thiết hoặc tạo riêng 1 API resend-otp
            });
            toast.info('A new OTP code has been sent to your inbox!');
        } catch (err) {
            toast.error('Unable to resend the code, please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
  

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo ứng dụng */}
        <div className="auth-logo"><MdAutoAwesome size={32} /></div>
        
        <h3 className="auth-title">Verify Your Account</h3>
        <p className="auth-subtitle">
          We've sent a 6-digit code to <br/>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Hiển thị thông báo lỗi từ API nếu có */}
          {apiError && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              {apiError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Enter 6-digit Code</label>
            <div className="input-wrapper">
              <MdVpnKey className="input-icon-left" size={20} />
              <input 
                type="text"
                className="form-control-pro"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-primary" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="auth-footer">
            <p>Didn't receive the code?</p>
            <button 
                type="button"
                className="auth-link" 
                onClick={handleResendOtp} // Gọi hàm gửi lại mã thay vì navigate
                disabled={isLoading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
                {isLoading ? 'Sending...' : 'Resend OTP Code'}
            </button>
            <br />
            <button onClick={() => navigate('/register')} style={{fontSize: '12px', marginTop: '10px', opacity: 0.7}}>
                Back to Register
            </button>      
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;