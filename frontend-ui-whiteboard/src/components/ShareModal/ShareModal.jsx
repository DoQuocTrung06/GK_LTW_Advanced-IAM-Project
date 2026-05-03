import React, { useState } from 'react';
import { MdClose, MdContentCopy, MdPublic, MdLock } from 'react-icons/md';
import { toast } from 'react-toastify';
import './ShareModal.css';

function ShareModal({ isOpen, onClose, boardId, currentVisibility }) {
  const [visibility, setVisibility] = useState(currentVisibility || 'private');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi gọi API

  if (!isOpen) return null;

  // Link chia sẻ thực tế
  const shareLink = `${window.location.origin}/board/${boardId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!"); 
  };

  // 1. GỌI API MỜI BẠN BÈ
  const handleInvite = async (e) => {
    e.preventDefault(); // Ngăn form tải lại trang
    if (!inviteEmail) return;

    setIsLoading(true);
    const token = localStorage.getItem('auth_token'); // Lấy thẻ căn cước

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/${boardId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` // Gửi token lên Laravel
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Access granted to ${inviteEmail}!`); 
        setInviteEmail(''); // Làm sạch ô nhập
      } else {
        toast.error(data.message || "Could not invite this email."); 
      }
    } catch (error) {
      console.error("Invite error:", error); 
      toast.error("Server connection error."); 
    } finally {
      setIsLoading(false);
    }
  };

  // 2. GỌI API CẬP NHẬT QUYỀN PUBLIC/PRIVATE
  const handleVisibilityChange = async (e) => {
    const newVisibility = e.target.value;
    const previousVisibility = visibility;
    
    // Cập nhật UI ngay lập tức cho mượt mà (Optimistic UI)
    setVisibility(newVisibility);

    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/${boardId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ visibility: newVisibility })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(newVisibility === 'public' ? "Changed to Public!" : "Changed to Private!"); 
      } else {
        // Nếu API lỗi, lùi về trạng thái cũ
        setVisibility(previousVisibility);
        toast.error(data.message || "Error updating visibility."); 
      }
    } catch (error) {
      console.error("Visibility update error:", error); 
      setVisibility(previousVisibility); // Lùi về trạng thái cũ
      toast.error("Server connection error."); 
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Share Whiteboard</h3>
          {/* THÊM type="button" để tránh nảy sinh lỗi submit ẩn */}
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <MdClose size={24} />
          </button>
        </div>

        {/* Ô nhập Email */}
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input 
            type="email" 
            placeholder="Add people by email..." 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={isLoading}
          />
          {/* Nút này trong form nên type="submit" là ĐÚNG */}
          <button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Sending...' : 'Invite'}
          </button>
        </form>

        {/* Chọn quyền truy cập */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>General access</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {visibility === 'public' ? <MdPublic size={24} color="#4f46e5"/> : <MdLock size={24} color="#64748b"/>}
            <select 
              value={visibility} 
              onChange={handleVisibilityChange}
            >
              <option value="private">Restricted (Only invited people)</option>
              <option value="public">Anyone with the link</option>
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

        {/* Copy Link & Done */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* THÊM type="button" */}
          <button type="button" className="copy-btn" onClick={handleCopyLink}>
            <MdContentCopy size={18} /> Copy link
          </button>
          {/* THÊM type="button" */}
          <button type="button" className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

export default ShareModal;