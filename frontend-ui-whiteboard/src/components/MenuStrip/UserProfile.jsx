import React from 'react';
import { MdClose, MdLogout, MdVerifiedUser, MdEmail } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserProfile.css';

/**
 * Hàm lấy 2 chữ cái đầu của tên làm Avatar (VD: "Do Quoc Trung" -> "DT")
 */
const getInitials = (name) => {
  if (!name) return "U"; // Mặc định là U (User) nếu không có tên
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

function UserProfile({ isOpen, toggleProfile, closeMenu, currentUser }) { 
  const navigate = useNavigate();
  const isLoggedIn = !!currentUser; 

  const handleLogout = async () => {
    try {
      // Đã sửa 'token' thành 'auth_token' cho khớp với hệ thống của bạn
      const token = localStorage.getItem('auth_token');
      if (token) {
        await axios.post('http://localhost:8000/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Xóa đúng tên auth_token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      closeMenu();
      toast.info("Logged out successfully");
      navigate('/login');
    }
  };

  const initials = getInitials(isLoggedIn ? currentUser.name : "");

  return (
    <div className="pro-profile-container">
      {/* TRIGGER AVATAR GÓC TRÊN */}
      <div onClick={toggleProfile} className={`pro-avatar-trigger ${isOpen ? 'active' : ''}`}>
        {isLoggedIn && currentUser.avatar ? (
          <img src={currentUser.avatar} alt="User Avatar" className="rounded-circle" />
        ) : (
          <div className="initial-avatar-sm">
            {isLoggedIn ? initials : "?"}
          </div>
        )}
      </div>

      {/* MENU DROP DOWN */}
      {isOpen && (
        <div className="pro-dropdown-card shadow-lg">
          <div className="pro-card-header">
            <span className="status-badge-verified">
              {isLoggedIn ? <><MdVerifiedUser /> Account Verified</> : "Guest Mode"}
            </span>
            <button className="pro-btn-close" onClick={closeMenu}><MdClose /></button>
          </div>

          <div className="pro-card-body text-center">
            {/* AVATAR LỚN BÊN TRONG */}
            <div className="avatar-preview-lg-container">
              {isLoggedIn && currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Profile" className="avatar-preview-lg" />
              ) : (
                <div className="initial-avatar-lg">
                  {isLoggedIn ? initials : "?"}
                </div>
              )}
            </div>
            
            <h5 className="pro-user-name">
              {isLoggedIn ? currentUser.name : "Welcome Guest"}
            </h5>
            <p className="pro-user-email">
              <MdEmail /> {isLoggedIn ? currentUser.email : "Sign in to sync your work"}
            </p>

            {/* GIAO DIỆN KHI CHƯA ĐĂNG NHẬP */}
            {!isLoggedIn && (
              <div className="action-group-horizontal">
                <button className="pro-btn-signin" onClick={() => { closeMenu(); navigate('/login'); }}>Sign In</button>
                <button className="pro-btn-signup" onClick={() => { closeMenu(); navigate('/register'); }}>Join Now</button>
              </div>
            )}
            {/* Đã xóa 2 nút Manage Account và Workspace Settings */}
          </div>

          {/* CHỈ HIỆN NÚT SIGN OUT NẾU ĐÃ ĐĂNG NHẬP */}
          {isLoggedIn && (
            <div className="pro-card-footer">
              <button className="pro-btn-logout" onClick={handleLogout}>
                <MdLogout /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserProfile;