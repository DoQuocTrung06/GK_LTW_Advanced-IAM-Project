import React, { useState, useEffect, useRef } from 'react';
import './MenuStrip.css';
import UserProfile from './UserProfile';
import { toast } from 'react-toastify';

function MenuStrip({ 
  onSave, onUndo, onRedo, canUndo, canRedo, onNew, onZoomIn, 
  onZoomOut, onOpen, onResetZoom, onShare, onCut, 
  hasUnsavedChanges, canPaste, onCopy, onPaste, activeUsers = [], currentUser, boardCreatorId  
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Xử lý đóng menu khi click ra ngoài vùng menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng/Mở các tab menu (File, Edit, View)
  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    setIsProfileOpen(false);
  };

  // Đóng/Mở menu User Profile
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setActiveMenu(null);
  };

  const handleProtectedAction = (actionName, callback) => {
    if (!currentUser) { // Nếu không có user -> Chặn ngay
      toast.warn(`Please sign in to use ${actionName}!`);
      setIsProfileOpen(true); // Tự bật menu đăng nhập
      return;
    }
    if (callback) callback(); // Có user thì mới cho chạy tiếp
  };

  // Xử lý các hành động từ menu Dropdown
  const handleAction = (action) => {
    switch (action) {
      case 'new':
        handleProtectedAction('New File', () => {
          if (hasUnsavedChanges) setPendingAction('new');
          else if (onNew) onNew();
        });
        break;
      case 'open':
        handleProtectedAction('Open File', () => {
          if (hasUnsavedChanges) setPendingAction('open');
          else if (onOpen) onOpen();
        });
        break;
      case 'save':
        handleProtectedAction('Save', onSave);
        break;
      case 'zoomIn':
        handleProtectedAction('Zoom In', onZoomIn);
        break;
      case 'zoomOut':
        handleProtectedAction('Zoom Out', onZoomOut);
        break;
      case 'resetZoom':
        handleProtectedAction('Reset Zoom', onResetZoom);
        break;
      case 'cut':
        handleProtectedAction('Cut', onCut);
        break;
      case 'copy':
        handleProtectedAction('Copy', onCopy);
        break;
      case 'paste':
        handleProtectedAction('Paste', onPaste);
        break;
      default:
        break;
    }
    setActiveMenu(null);
  };

  // Xử lý quyết định trong Modal (Khi có thay đổi chưa lưu)
  const handleModalDecision = async (decision) => {
    if (decision === 'cancel') {
      setPendingAction(null);
      return;
    }
    
    if (decision === 'save') {
      // Kể cả trong Modal cũng phải kiểm tra đăng nhập khi bấm Save
      if (!currentUser) {
        toast.warn("Sign in required to save!");
        setIsProfileOpen(true);
        setPendingAction(null);
        return;
      }
      if (onSave) await onSave();
    }

    if (pendingAction === 'new' && onNew) onNew();
    if (pendingAction === 'open' && onOpen) onOpen();
    setPendingAction(null);
  };

  return (
    <>
      <div className="menu-strip-container" ref={menuRef}>
        {/* LOGO */}
        <div className="logo-container">
          <svg className="app-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
            <path d="M12 18v4"></path>
            <path d="M8 22h8"></path>
            <path d="M9 10a4 4 0 0 1 6 0" strokeDasharray="2 2"></path>
            <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
          </svg>
        </div>

        {/* TABS MENU */}
        <div className="menu-tabs">
          {/* FILE MENU */}
          <div className="menu-item">
            <div className={`menu-tab ${activeMenu === 'file' ? 'active' : ''}`} onClick={() => toggleMenu('file')}>
              File
            </div>
            {activeMenu === 'file' && (
              <div className="dropdown-content">
                <button onClick={() => handleAction('new')}>New</button>
                <button onClick={() => handleAction('open')}>Open</button>
                <button onClick={() => handleAction('save')}>Save</button>
              </div>
            )}
          </div>

          {/* EDIT MENU */}
          <div className="menu-item">
            <div className={`menu-tab ${activeMenu === 'edit' ? 'active' : ''}`} onClick={() => toggleMenu('edit')}>
              Edit
            </div>
            {activeMenu === 'edit' && (
              <div className="dropdown-content">
                <button onClick={() => handleAction('cut')}>Cut</button>
                <button onClick={() => handleAction('copy')}>Copy</button>
                <button 
                  onClick={() => handleAction('paste')} 
                  disabled={!canPaste}
                  style={{ 
                    opacity: canPaste ? 1 : 0.4, 
                    cursor: canPaste ? 'pointer' : 'not-allowed' 
                  }}
                >
                  Paste
                </button>
              </div>
            )}
          </div>

          {/* VIEW MENU */}
          <div className="menu-item">
            <div className={`menu-tab ${activeMenu === 'view' ? 'active' : ''}`} onClick={() => toggleMenu('view')}>
              View
            </div>
            {activeMenu === 'view' && (
              <div className="dropdown-content">
                <button onClick={() => handleAction('zoomIn')}>Zoom In</button>
                <button onClick={() => handleAction('zoomOut')}>Zoom Out</button>
                <button onClick={() => handleAction('resetZoom')}>Default</button>
              </div>
            )}
          </div>
        </div>

        <div className="divider-vertical"></div>

        {/* QUICK ACCESS BAR */}
        <div className="quick-access-bar" style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            
            
            {/* Nút Save nhanh */}
            <button onClick={() => handleProtectedAction('Save', onSave)} className="quick-btn" title="Save">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            </button>

            {/* Nút Share nhanh */}
            <button onClick={() => handleProtectedAction('Share', onShare)} className="quick-btn" title="Share">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            </button>

            <div className="divider-vertical"></div>
            
            {/* Nút Undo - Chỉ cho bấm nếu đã đăng nhập và có thể undo */}
            <button 
              onClick={() => handleProtectedAction('Undo', onUndo)} 
              disabled={!canUndo && currentUser} 
              className="quick-btn" 
              title="Undo"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3l-3 2.7"></path></svg>
            </button>

            {/* Nút Redo */}
            <button 
              onClick={() => handleProtectedAction('Redo', onRedo)} 
              disabled={!canRedo && currentUser} 
              className="quick-btn" 
              title="Redo"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
            </button>

            <div className="divider-vertical"></div>

            {/* DANH SÁCH NGƯỜI ONLINE (ĐÃ SỬA LỖI ẨN AVATAR) */}
            <div className="active-users-list" style={{ display: 'flex', marginRight: '10px' }}>
              {/* Đã xóa hàm .filter() để không ẩn chính mình nữa */}
              {activeUsers.map((user, index) => {
                
                
                // 1. ĐỒNG BỘ MÀU 
                const avatarColors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];
                const userColor = avatarColors[user.id % avatarColors.length] || '#4f46e5';
                
                // 2. SO SÁNH ADMIN
                const isAdmin = Number(user.id) === Number(boardCreatorId);

                // 3. THÊM MỚI: Kiểm tra xem avatar này có phải là CỦA CHÍNH MÌNH không
                const isMe = currentUser && Number(user.id) === Number(currentUser.id);

                return (
                  <div 
                    key={user.id} 
                    className={`online-avatar-wrapper ${isMe ? 'is-me' : ''}`}
                    title={`${user.name} ${isMe ? "(You)" : ""} ${isAdmin ? "(Admin Board)" : ""}`}
                    style={{ 
                      marginLeft: index === 0 ? '0' : '-10px', 
                      zIndex: isMe ? 10 : (5 - index) // Mình nổi lên trên cùng, người khác đè theo thứ tự
                    }}
                  >
                    <div 
                      className="online-avatar-circle" 
                      style={{ background: userColor }}
                    >
                      {user?.name ? user.name.charAt(0) : '?'}
                    </div>

                    {/* VƯƠNG MIỆN DÀNH CHO ADMIN */}
                    {isAdmin && (
                      <span className="admin-crown-badge">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* USER PROFILE & AVATAR */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserProfile 
              isOpen={isProfileOpen} 
              toggleProfile={toggleProfile} 
              closeMenu={() => setIsProfileOpen(false)} 
              currentUser={currentUser}
              boardCreatorId={boardCreatorId}
            />
          </div>
        </div>
      </div>

      {/* MODAL THÔNG BÁO CHƯA LƯU */}
      {pendingAction && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Unsaved Changes</h3>
            <p className="modal-text">Do you want to save your progress before leaving?</p>
            <div className="modal-buttons">
              <button className="modal-btn btn-primary" onClick={() => handleModalDecision('save')}>Save</button>
              <button className="modal-btn btn-secondary" onClick={() => handleModalDecision('dont-save')}>Don't Save</button>
              <button className="modal-btn btn-secondary" onClick={() => handleModalDecision('cancel')}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MenuStrip;