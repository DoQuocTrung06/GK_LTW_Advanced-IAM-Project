import { useMemo } from 'react';

export const usePermissions = (role) => {
  return useMemo(() => {
    const currentRole = role || 'viewer'; 

    return {
      
      canDraw: ['owner', 'editor'].includes(currentRole),
      
      
      canManageBoard: currentRole === 'owner',
      
      
      isReadOnly: currentRole === 'viewer',
    };
  }, [role]);
};