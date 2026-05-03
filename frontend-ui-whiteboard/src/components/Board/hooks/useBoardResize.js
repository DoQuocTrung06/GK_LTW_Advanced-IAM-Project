import { useState, useRef, useEffect } from 'react';

export const useBoardResize = (initialZoomLevel) => {
  const [paperSize, setPaperSize] = useState({ width: 800, height: 600 });
  const paperRef = useRef(null);
  const resizing = useRef(null);

  const handleResizeStart = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = dir;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!resizing.current || !paperRef.current) return;
    
    const rect = paperRef.current.getBoundingClientRect();
    if (resizing.current === 'right' || resizing.current === 'corner') {
      const newWidth = (e.clientX - rect.left) / initialZoomLevel;
      setPaperSize(prev => ({ ...prev, width: Math.max(200, newWidth) })); 
    }
    if (resizing.current === 'bottom' || resizing.current === 'corner') {
      const newHeight = (e.clientY - rect.top) / initialZoomLevel;
      setPaperSize(prev => ({ ...prev, height: Math.max(200, newHeight) }));
    }
  };

  const handleResizeEnd = () => {
    resizing.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return { paperSize, setPaperSize, paperRef, handleResizeStart };
};