import React, { useState, useEffect } from 'react';
import { MdClose, MdContentCopy, MdPublic, MdLock } from 'react-icons/md';
import { toast } from 'react-toastify';
import './ShareModal.css';

// 1. THÊM PROP onVisibilityUpdated VÀO ĐÂY
function ShareModal({ isOpen, onClose, boardId, currentVisibility, onVisibilityUpdated }) {
  const [visibility, setVisibility] = useState(currentVisibility || 'private');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const actualVisibility = currentVisibility || 'private';
      setVisibility(actualVisibility);
    }
  }, [isOpen, currentVisibility]); 

  if (!isOpen) return null;

  const shareLink = `${window.location.origin}/board/${boardId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!"); 
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsLoading(true);
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/${boardId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Access granted to ${inviteEmail}!`); 
        setInviteEmail('');
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

  const handleVisibilityChange = async (e) => {
    const newVisibility = e.target.value;
    const previousVisibility = visibility;
    
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
        
        // 2. NẾU THÀNH CÔNG, GỌI HÀM NÀY ĐỂ BÁO CHO THẰNG CHA BIẾT MÀ CẬP NHẬT
        if (onVisibilityUpdated) {
          onVisibilityUpdated(newVisibility);
        }

      } else {
        setVisibility(previousVisibility);
        toast.error(data.message || "Error updating visibility."); 
      }
    } catch (error) {
      console.error("Visibility update error:", error); 
      setVisibility(previousVisibility);
      toast.error("Server connection error."); 
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Share Whiteboard</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input 
            type="email" 
            placeholder="Add people by email..." 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Sending...' : 'Invite'}
          </button>
        </form>

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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="copy-btn" onClick={handleCopyLink}>
            <MdContentCopy size={18} /> Copy link
          </button>
          <button type="button" className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

export default ShareModal;