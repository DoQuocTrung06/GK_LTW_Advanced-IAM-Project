import { useMemo } from 'react';

export const usePermissions = (role) => {
  return useMemo(() => {
    const currentRole = role || 'viewer'; // Mặc định là viewer nếu chưa có data

    return {
      // Quyền Vẽ: Chỉ owner và editor mới được vẽ
      canDraw: ['owner', 'editor'].includes(currentRole),
      
      // Quyền Quản lý (Share, Xóa bảng): Chỉ owner mới được làm
      canManageBoard: currentRole === 'owner',
      
      // Kiểm tra xem có phải chỉ được xem không
      isReadOnly: currentRole === 'viewer',
    };
  }, [role]);
};