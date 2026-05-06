import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdSecurity, MdContentCopy, MdCheckCircle } from "react-icons/md";
import './Setup2FA.css'; // Lát nữa tạo file CSS này

function Setup2FA({ currentUser, onSetupSuccess }) {
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 1. Gọi API lấy mã QR
  const handleGenerate2FA = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/2fa/generate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrData({
        svg: response.data.qr_code_svg,
        secret: response.data.secret
      });
    } catch (err) {
      toast.error("Failed to generate 2FA code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Gọi API gửi mã 6 số lên để xác nhận bật 2FA
  const handleVerify2FA = async () => {
    if (otpCode.length !== 6) {
      toast.warning("Please enter a valid 6-digit code.");
      return;
    }
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/user/2fa/verify`, 
        { otp: otpCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("2FA Enabled Successfully!");
      setQrData(null); 
      
      // Báo cho component cha (UserProfile) biết là đã bật thành công
      if (onSetupSuccess) {
        onSetupSuccess();
      }

    } catch (err) {
      toast.error("Invalid code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      toast.success("Secret key copied!");
    }
  };

  // Nếu user đã bật 2FA rồi thì hiển thị thông báo đã bảo mật
  if (currentUser?.two_factor_enabled) {
    return (
      <div className="pro-2fa-enabled-badge">
        <MdCheckCircle size={18} color="#059669" />
        <span>2FA Security Enabled</span>
      </div>
    );
  }

  // Nếu chưa bật, và chưa bấm "Setup"
  if (!qrData) {
    return (
      <button className="pro-btn-2fa" onClick={handleGenerate2FA} disabled={isLoading}>
        <MdSecurity /> {isLoading ? "Generating..." : "Setup 2FA Security"}
      </button>
    );
  }

  // Giao diện khi đang hiển thị mã QR và ô nhập mã 6 số
  return (
    <div className="pro-2fa-box">
      <p className="pro-2fa-instruction">1. Scan QR with Authenticator app:</p>
      
      <div 
        className="qr-svg-wrapper" 
        dangerouslySetInnerHTML={{ __html: qrData.svg }} 
      />
      
      <div className="secret-key-box">
        <span className="secret-text">{qrData.secret}</span>
        <button className="btn-copy-secret" onClick={copyToClipboard} title="Copy Key">
          <MdContentCopy />
        </button>
      </div>

      <p className="pro-2fa-instruction" style={{ marginTop: '12px' }}>2. Enter the 6-digit code:</p>
      
      <div className="otp-input-group">
        <input 
          type="text" 
          maxLength="6"
          placeholder="000000" 
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Chỉ cho nhập số
          className="otp-input-control"
        />
        <button 
          onClick={handleVerify2FA} 
          disabled={isVerifying}
          className="otp-btn-verify"
        >
          {isVerifying ? "..." : "Verify"}
        </button>
      </div>
    </div>
  );
}

export default Setup2FA;