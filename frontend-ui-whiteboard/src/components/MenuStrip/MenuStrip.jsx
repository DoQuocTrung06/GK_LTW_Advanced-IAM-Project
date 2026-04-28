import React, { useState, useEffect, useRef } from 'react';
import './MenuStrip.css';
import UserProfile from './UserProfile';

// Mình thêm prop 'onNew' vào đây để nhận lệnh xóa bảng từ App.jsx
function MenuStrip({ onSave, onUndo, onRedo, canUndo, canRedo, onNew, onZoomIn, onZoomOut, onOpen, onResetZoom, onShare, onCut, hasUnsavedChanges, canPaste , onCopy ,onPaste, currentUser }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  // [BƯỚC 2] State cho UserProfile Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);

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

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    setIsProfileOpen(false); // Nếu bấm vào menu File/Edit thì đóng menu User
  };

  // [BƯỚC 4] Hàm toggle riêng cho UserProfile
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setActiveMenu(null); // Nếu bấm vào Avatar thì đóng menu File/Edit
  };

  const handleAction = (action) => {
  if (action === 'save' && onSave) {
    onSave();
  } else if (action === 'new') {
    // Nếu có thay đổi chưa lưu -> Bật Modal hỏi
    // Nếu không (đã lưu hoặc bảng trắng) -> Xóa bảng luôn
    if (hasUnsavedChanges) {
      setPendingAction('new');
    } else {
      if (onNew) onNew();
    }
  } else if (action === 'open') {
    // Tương tự cho nút Open
    if (hasUnsavedChanges) {
      setPendingAction('open');
    } else {
      if (onOpen) onOpen();
    }
  } else if (action === 'zoomIn' && onZoomIn) {
    onZoomIn();
  } else if (action === 'zoomOut' && onZoomOut) {
    onZoomOut();
  } else if (action === 'resetZoom' && onResetZoom) {
    onResetZoom();
  } else if (action === 'cut' && onCut) {
    onCut();
  } else if (action === 'copy' && onCopy) {
    onCopy();
  } else if (action === 'paste' && onPaste) {
    onPaste();
  }
  
  setActiveMenu(null); // Đóng menu dropdown sau khi bấm
};

  // HÀM XỬ LÝ KHI NGƯỜI DÙNG BẤM NÚT TRONG MODAL
  const handleModalDecision = async (decision) => {
    // Nếu chọn Cancel -> Đóng modal, không làm gì cả
    if (decision === 'cancel') {
      setPendingAction(null);
      return;
    }

    // Nếu chọn Save -> Lưu ảnh trước
    if (decision === 'save' && onSave) {
      await onSave();
    }

    // Sau khi xử lý lưu/không lưu xong, tiếp tục thực hiện hành động New/Open
    if (pendingAction === 'new' && onNew) onNew();
    if (pendingAction === 'open' && onOpen) onOpen();

    // Đóng Modal
    setPendingAction(null);
  };


  return (
    <>
    <div className="menu-strip-container" ref={menuRef}>

      {/* THÊM MỚI: LOGO BẢNG VÀ KẾT NỐI (SOCKET) */}
      <div className="logo-container">
        <svg className="app-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Hình cái bảng */}
          <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
          <path d="M12 18v4"></path>
          <path d="M8 22h8"></path>
          {/* Biểu tượng sóng Socket / Wifi bên trong bảng */}
          <path d="M9 10a4 4 0 0 1 6 0" strokeDasharray="2 2"></path>
          <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
        </svg>
      </div>

      <div className="menu-tabs">
        
        {/* === FILE MENU === */}
        <div className="menu-item">
          <div className={`menu-tab ${activeMenu === 'file' ? 'active' : ''}`} onClick={() => toggleMenu('file')}>
            File
          </div>
          {activeMenu === 'file' && (
            <div className="dropdown-content">
              <button onClick={() => handleAction('new')}>
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>New</span>
              </button>

              <button onClick={() => handleAction('open')}>
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"></path></svg>
                <span>Open</span>
              </button>

              <button onClick={() => handleAction('save')}>
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                <span>Save</span>
              </button>
              
              
            </div>
          )}
        </div>

        {/* === EDIT MENU === */}
        <div className="menu-item">
            <div className={`menu-tab ${activeMenu === 'edit' ? 'active' : ''}`} onClick={() => toggleMenu('edit')}>
              Edit
            </div>
            {activeMenu === 'edit' && (
              <div className="dropdown-content">
                <button onClick={() => handleAction('cut')}>
                  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
                  <span>Cut</span>
                </button>
                <button onClick={() => handleAction('copy')}>
                  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Copy</span>
                </button>
                <button 
                  onClick={() => handleAction('paste')} 
                  disabled={!canPaste} 
                  style={{ opacity: canPaste ? 1 : 0.4, cursor: canPaste ? 'pointer' : 'not-allowed' }}
                >
                  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  <span>Paste</span>
                </button>
              </div>
            )}
          </div>

        {/* === VIEW MENU === */}
        <div className="menu-item">
          <div className={`menu-tab ${activeMenu === 'view' ? 'active' : ''}`} onClick={() => toggleMenu('view')}>
            View
          </div>
          {activeMenu === 'view' && (
            <div className="dropdown-content">
              <button onClick={() => handleAction('zoomIn')}>
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                <span>Zoom In</span>
              </button>
              <button onClick={() => handleAction('zoomOut')}>
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                <span>Zoom Out</span>
              </button>

              <button onClick={() => handleAction('resetZoom')}>
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Default</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="divider-vertical"></div>

      {/* Phần giữa/phải: Quick Access & Avatar */}
        <div className="quick-access-bar" style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between' }}>
          
          {/* Nhóm các nút thao tác */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={onSave} title="Save" className="quick-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            </button>
            <button title="Share" className="quick-btn" onClick={onShare}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            </button>
            <div className="divider-vertical"></div>
            <button onClick={onUndo} disabled={!canUndo} title="Undo" className="quick-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3l-3 2.7"></path></svg>
            </button>
            <button onClick={onRedo} disabled={!canRedo} title="Redo" className="quick-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
            </button>
          </div>

          {/* [BƯỚC 5] Chèn Component UserProfile vào bên phải */}
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
    {pendingAction && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-close" onClick={() => handleModalDecision('cancel')}>✕</div>
            <h3 className="modal-title">Unsaved Changes</h3>
            <p className="modal-text">Do you want to save the current drawing before opening a new one?</p>
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