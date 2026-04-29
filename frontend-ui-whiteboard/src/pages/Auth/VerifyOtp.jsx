import React, { useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MdVpnKey, MdAutoAwesome } from "react-icons/md";
import './Auth.css'; 
import { toast } from 'react-toastify';


function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy dữ liệu ẩn danh, nếu không có flow thì mặc định là từ lúc đăng ký (REGISTER)
  const email = location.state?.email || ''; 
  const flow = location.state?.flow || 'REGISTER'; 

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Nếu truy cập trái phép không có email, đẩy về trang login
  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/verify-otp', {
        email: email, 
        otp: otp
      });

      if (response.status === 200) {
        toast.success('Verification successful!');
        
        // ĐIỀU HƯỚNG DỰA VÀO LUỒNG (FLOW)
        if (flow === 'FORGOT_PASSWORD') {
            // Chuyển sang trang đặt lại mật khẩu, mang theo OTP ngầm
            navigate('/reset-password', { state: { email: email, otp: otp } });
        } else {
            // Đăng ký thành công thì về thẳng Login
            setTimeout(() => navigate('/login'), 2000); 
        }
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'The OTP code is incorrect!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true); 
    try {
      // SỬA LỖI LOGIC TẠI ĐÂY: Nếu là luồng quên MK thì phải gọi API forgot-password để lấy OTP mới
      const endpoint = flow === 'FORGOT_PASSWORD' 
          ? 'http://localhost:8000/api/forgot-password'
          : 'http://localhost:8000/api/resend-otp';

      const response = await axios.post(endpoint, { email: email });
      toast.success(response.data.message || "A new OTP code has been sent!");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to resend the code, please try again later.");
    } finally {
      setIsLoading(false); 
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo"><MdAutoAwesome size={32} /></div>
        
        <h3 className="auth-title">Verify Your Account</h3>
        <p className="auth-subtitle">
          We've sent a 6-digit code to <br/>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
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
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="auth-footer text-center mt-4">
            <p style={{ marginBottom: '8px', color: '#64748b' }}>Didn't receive the code?</p>
            
            <button 
                type="button"
                onClick={handleResendOtp} 
                disabled={isLoading} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: isLoading ? 'not-allowed' : 'pointer', 
                  fontWeight: 'bold',
                  color: isLoading ? '#94a3b8' : '#4f46e5',
                  transition: '0.2s'
                }}
            >
                {isLoading ? 'Sending...' : 'Resend OTP Code'}
            </button>
            
            <br />
            {/* Chỉ hiện nút Back to Register nếu không phải là luồng Forgot Password */}
            {flow !== 'FORGOT_PASSWORD' && (
              <button 
                type="button"
                onClick={() => navigate('/register')} 
                style={{
                  fontSize: '13px', 
                  marginTop: '16px', 
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                  Back to Register
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;