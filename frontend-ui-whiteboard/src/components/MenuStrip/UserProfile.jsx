import React, { useState } from 'react'; // BỔ SUNG: Import thêm useState
import { MdClose, MdLogout, MdVerifiedUser, MdEmail} from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserProfile.css';
import { getUserColor } from '../Board/utils/userColors';
import Setup2FA from './Setup2FA';

const getInitials = (name) => {
  if (!name) return "U"; 
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

function UserProfile({ isOpen, toggleProfile, closeMenu, currentUser, boardCreatorId }) { 
  const navigate = useNavigate();
  const isLoggedIn = !!currentUser; 

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      closeMenu();
      toast.info("Logged out successfully");
      navigate('/login');
    }
  };


  const initials = getInitials(isLoggedIn ? currentUser.name : "");
  const myColor = currentUser ? getUserColor(currentUser.id) : 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)';

  return (
    <div className="pro-profile-container">
      <div onClick={toggleProfile} className={`pro-avatar-trigger ${isOpen ? 'active' : ''}`}>
        {isLoggedIn && currentUser.avatar ? (
          <img src={currentUser.avatar} alt="User Avatar" className="rounded-circle" />
        ) : (
          <div className="initial-avatar-sm" style={{ background: myColor }}>
            {isLoggedIn ? initials : "?"}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="pro-dropdown-card shadow-lg">
          <div className="pro-card-header">
            <span className="status-badge-verified">
              <MdVerifiedUser /> Account Verified
            </span>
            <button className="pro-btn-close" onClick={closeMenu}><MdClose /></button>
          </div>

          <div className="pro-card-body text-center">
            <div className="avatar-preview-lg-container">
              {isLoggedIn && currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Profile" className="avatar-preview-lg" />
              ) : (
                <div className="initial-avatar-lg" style={{ background: myColor }}>
                  {isLoggedIn ? initials : "?"}
                </div>
              )}
            </div>
            
            <h5 className="pro-user-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              {currentUser.name}
              
              {isLoggedIn && Number(currentUser.id) === Number(boardCreatorId) && (
                <span title="Board Admin" style={{ color: '#fbbf24', display: 'flex' }}>
                   <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </span>
              )}
            </h5>
            <p className="pro-user-email">
              <MdEmail /> {currentUser.email}   
            </p>

            {isLoggedIn && (
              <Setup2FA 
                currentUser={currentUser} 
                onSetupSuccess={() => {
                  currentUser.two_factor_enabled = true;
                }} 
              />
            )}

          </div>
          
          <div className="pro-card-footer">
            <button className="pro-btn-logout" onClick={handleLogout}>
              <MdLogout /> Sign Out
            </button>
          </div>
         
        </div>
      )}
    </div>
  );
}

export default UserProfile;