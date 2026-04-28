import React from 'react';
import { MdLogin, MdClose, MdAccountCircle, MdAdd, MdLogout, MdSyncProblem, MdPersonAddAlt1 } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

// Thêm prop 'currentUser' để nhận dữ liệu thật từ hệ thống sau khi đăng nhập
function UserProfile({ isOpen, toggleProfile, closeMenu, currentUser }) { 
  const navigate = useNavigate();
  
  // Trạng thái đăng nhập giờ phụ thuộc vào việc currentUser có tồn tại không
  const isLoggedIn = !!currentUser; 

  // HÀM ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem('auth_token'); // Xóa token
    localStorage.removeItem('user');       // Xóa thông tin user
    closeMenu();
    navigate('/login'); // Quay về trang đăng nhập
    window.location.reload(); // Reload để xóa sạch trạng thái cũ nếu cần
  };

  return (
    <div className="pro-profile-container ms-3">
      
      {/* 1. NÚT AVATAR TRÊN THANH MENU STRIP */}
      <div 
        onClick={toggleProfile}
        className={`avatar-button-wrapper ${isOpen ? 'active' : ''}`}
        title={isLoggedIn ? currentUser.email : "Not signed in"}
      >
        {isLoggedIn && currentUser.avatar ? (
          // Nếu có ảnh thật từ Google/Backend -> Hiện ảnh
          <img src={currentUser.avatar} alt="User Avatar" className="avatar-img-strip" />
        ) : (
          // Nếu không -> Hiện Icon mặc định
          <MdAccountCircle size={42} className="avatar-icon" />
        )}
      </div>

      {/* 2. MENU XỔ XUỐNG */}
      {isOpen && (
        <div className="pro-dropdown animate__animated animate__fadeIn">
          
          {/* A. HEADER SECTION */}
          <div className="dropdown-header">
            <span className="current-email">
              {isLoggedIn ? currentUser.email : "Not signed in"}
            </span>
            <button className="close-btn" onClick={closeMenu}>
              <MdClose size={20} />
            </button>
          </div>

          {/* B. MAIN ACCOUNT CARD */}
          <div className="account-card">
            <div className="avatar-large-wrapper">
              {isLoggedIn && currentUser.avatar ? (
                 // Ảnh thật to ở giữa
                <img src={currentUser.avatar} alt="User Avatar" className="avatar-large-img" />
              ) : (
                <MdAccountCircle size={90} className="avatar-large-icon text-secondary" />
              )}
            </div>
            
            <h3 className="welcome-text">
              {/* Lấy tên thật từ Backend */}
              {isLoggedIn ? `Hi, ${currentUser.name}` : "Welcome, Guest"}
            </h3>
            
            {isLoggedIn && (
              <button className="manage-btn">
                Manage your Account
              </button>
            )}
          </div>

          {/* C. STATUS CARD */}
          {!isLoggedIn && (
            <div className="sync-status-card">
              <div className="sync-header">
                <MdSyncProblem size={22} className="text-danger" />
                <h4 className="sync-title text-danger">Data Not Synced</h4>
              </div>
              <p className="sync-desc">
                Your sketches are currently saved temporarily. Sign in now to securely back them up.
              </p>
            </div>
          )}

          {/* D. ACTION BUTTONS */}
          <div className="action-buttons-group">
            {!isLoggedIn ? (
              <div className="auth-buttons-row">
                <button 
                  className="btn-pro-login"
                  onClick={() => { closeMenu(); navigate('/login'); }}
                >
                  <MdLogin size={20} /> Sign in
                </button>
                
                <button 
                  className="btn-pro-register"
                  onClick={() => { closeMenu(); navigate('/register'); }}
                >
                  <MdPersonAddAlt1 size={18} /> Register
                </button>
              </div>
            ) : (
              <>
                <button className="btn-pro-secondary">
                  <MdAdd size={20}/> Add another account
                </button>
                <div className="divider-horizontal"></div>
                <button className="btn-pro-secondary">
                  {/* Chức năng đăng xuất sau này sẽ gọi API ở đây */}
                  <MdLogout size={20}/> Sign out
                </button>
              </>
            )}
          </div>

          {/* E. FOOTER LINKS */}
          <div className="dropdown-footer">
            <a href="#" className="footer-link">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;