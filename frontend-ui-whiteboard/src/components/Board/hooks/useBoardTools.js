import { useState } from 'react';
import echo from '../../../echo';

export const useBoardTools = ({
  lines, setLines, redoStack, setRedoStack, bgImage, setBgImage, boardData, stageRef, selectedItemIds, setSelectedItemIds, ignoredIdsRef
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lastSavedData, setLastSavedData] = useState({ lines: [], bgImage: null });
  
  const hasUnsavedChanges = lines !== lastSavedData.lines || bgImage !== lastSavedData.bgImage;

  
  const broadcastAction = (actionData) => {
    const token = localStorage.getItem('auth_token');
    if (token && boardData?.id && boardData.id !== 'temp') {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` 
      };
      if (echo.socketId()) headers['X-Socket-ID'] = echo.socketId();

      
      fetch(`${import.meta.env.VITE_API_URL}/boards/${boardData.id}/broadcast-draw`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ actionData })
      }).catch(err => console.error("Broadcast error:", err));
    }
  };

  const immediateSave = (newLines) => {
    if (!boardData || !boardData.id || boardData.id === 'temp') return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/boards/${boardData.id}/save-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ board_data: newLines })
    }).catch(err => console.error("Lỗi lưu khẩn cấp:", err));
  };

  const executeClearBoard = () => {
    
    if (ignoredIdsRef) {
      lines.forEach(line => ignoredIdsRef.current.add(line.id));
    }
    
    setLines([]); 
    setRedoStack([]); 
    setBgImage(null);
    setLastSavedData({ lines: [], bgImage: null });
    broadcastAction({ tool: 'clear', id: Date.now() });

    immediateSave([]);
  };

  const deleteSelectedItems = () => {
    if (!selectedItemIds || selectedItemIds.length === 0) return;
    
    
    if (ignoredIdsRef) {
      selectedItemIds.forEach(id => ignoredIdsRef.current.add(id));
    }

    const newLines = lines.filter(line => !selectedItemIds.includes(line.id));
    
    setLines(prev => prev.filter(line => !selectedItemIds.includes(line.id)));
    setSelectedItemIds([]);
    broadcastAction({ tool: 'delete_multiple', targetIds: selectedItemIds });
    immediateSave(newLines);
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    const lastLine = lines[lines.length - 1];
    if (!lastLine) return; 

    setRedoStack(prev => [...prev, lastLine]); 
    setLines(prev => prev.filter(line => line.id !== lastLine.id));
    broadcastAction({ tool: 'undo', targetId: lastLine.id, lineData: lastLine });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lineToRestore = redoStack[redoStack.length - 1];
    if (!lineToRestore) return; 

    setLines(prev => [...prev, lineToRestore]);
    setRedoStack(prev => prev.filter(line => line.id !== lineToRestore.id));

    const dataToSend = { ...lineToRestore };
    if (dataToSend.tool === 'fill') dataToSend.imageObj = null; 
    broadcastAction({ tool: 'redo', targetId: lineToRestore.id, lineData: dataToSend });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  const handleSave = async () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'my-drawing.png',
          types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
        });
        const response = await fetch(uri);
        const blob = await response.blob();
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) { console.log("Save cancelled"); }
    } else {
      const link = document.createElement('a');
      link.download = 'my-drawing.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setLastSavedData({ lines: lines, bgImage: bgImage });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = event.target.result;
        setBgImage(newImage); 
        setLines([]); 
        setRedoStack([]);
        setLastSavedData({ lines: [], bgImage: newImage });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  return {
    zoomLevel, hasUnsavedChanges,
    executeClearBoard, deleteSelectedItems , handleUndo, handleRedo,
    handleZoomIn, handleZoomOut, handleResetZoom, handleSave, handleFileChange
  };
};