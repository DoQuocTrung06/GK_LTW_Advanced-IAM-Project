import React, { useState, useEffect, useRef } from 'react';
import './MenuStrip.css';
import UserProfile from './UserProfile';
import { toast } from 'react-toastify';

function MenuStrip({ 
  onSave, onUndo, onRedo, canUndo, canRedo, onNew, onZoomIn, 
  onZoomOut, onOpen, onResetZoom, onShare, onCut, 
  hasUnsavedChanges, canPaste, onCopy, onPaste, currentUser 
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

  /**
   * [QUAN TRỌNG] Hàm bảo vệ chức năng
   * Nếu người dùng chưa đăng nhập, hàm này sẽ chặn lại, hiện thông báo và mở menu Sign In.
   */
  const handleProtectedAction = (featureName, callback) => {
    if (!currentUser) {
      // Hiện thông báo lỗi bằng tiếng Anh
      toast.error(`Please sign in to use ${featureName}!`, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      // Tự động mở menu Profile để người dùng thấy nút Sign In/Sign Up
      setIsProfileOpen(true); 
      setActiveMenu(null);
      return;
    }
    // Nếu đã đăng nhập, thực hiện chức năng như bình thường
    if (callback) callback();
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
                <button onClick={() => handleAction('paste')} disabled={!canPaste}>Paste</button>
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
          </div>

          {/* USER PROFILE & AVATAR */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserProfile 
              isOpen={isProfileOpen} 
              toggleProfile={toggleProfile} 
              closeMenu={() => setIsProfileOpen(false)} 
              currentUser={currentUser}
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