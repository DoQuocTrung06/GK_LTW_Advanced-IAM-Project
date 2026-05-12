import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import echo from '../../../echo'; 

export const useBoardSync = (id, lines, setLines, setRedoStack, setBgImage) => {
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState({ id: 'temp', board_code: 'guest', visibility: 'public' });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const lastFetchedId = useRef(null);

  
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } 
      catch (e) { console.error("Failed to parse user data"); }
    }
  }, []);

  
  useEffect(() => {
    const fetchBoard = async () => {
      const currentIdToFetch = id || 'new';
      if (lastFetchedId.current === currentIdToFetch) return;
      lastFetchedId.current = currentIdToFetch;

      const token = localStorage.getItem('auth_token');
      if (!token && id !== 'new') {
        toast.error("Please login to access this board");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/init/${currentIdToFetch}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });

        
        if (response.status === 401) {
          toast.warning("Session expired or unauthorized. Please login.");
          localStorage.removeItem('auth_token');
          navigate('/login');
          return;
        }

       
        if (response.status === 403) {
          toast.error("Access denied. You don't have permission to view this board.");
          navigate('/404'); 
          return;
        }

        if (!response.ok) {
           toast.error(response.status === 404 ? "Board not found" : "Server error");
           navigate('/404');
           return;
        }

        const data = await response.json();
        setBoardData(data);

        
        if (data.board_data) {
          try {
            let savedLines = data.board_data;
            while (typeof savedLines === 'string') savedLines = JSON.parse(savedLines);
            if (Array.isArray(savedLines)) {
              setLines(savedLines.map(line => line.tool === 'fill' ? { ...line, imageObj: null } : line));
            } else { setLines([]); }
          } catch (error) { setLines([]); }
        }

        if (!id || id === 'new') navigate(`/board/${data.id}`, { replace: true });
      } catch (error) {
        toast.error(error.message);
        lastFetchedId.current = null;
      }
    };
    fetchBoard();
  }, [id, navigate, setLines]);

 
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token || !currentUser || !boardData || boardData.id === 'temp') return;
    
    

    const channel = echo.join(`board.${boardData.id}`)
      .here((users) => setActiveUsers(users))
      .joining((user) => {
        toast.success(`${user.name} joined the board`, { autoClose: 2000 });
        setActiveUsers((prev) => prev.find(u => u.id === user.id) ? prev : [...prev, user]);
      })
      .leaving((user) => {
        toast.info(`${user.name} left the board`, { autoClose: 2000 });
        setActiveUsers((prev) => prev.filter(u => u.id !== user.id));
        
        setCursors((prev) => {
          const newCursors = { ...prev };
          delete newCursors[user.id];
          return newCursors;
        });
      })
      .listenForWhisper('cursor-move', (e) => {
        setCursors((prev) => ({
          ...prev,
          [e.userId]: { x: e.x, y: e.y, name: e.name }
        }));
      })
      .listen('.draw.action', (e) => {
        const incomingData = e.actionData; 
        if (!incomingData) return;

        if (incomingData.tool === 'clear') {
          setLines([]); setRedoStack([]); setBgImage(null); return; 
        }

        if (incomingData.tool === 'undo') {
          setLines(prevLines => prevLines.filter(line => line.id !== incomingData.targetId));
          if (incomingData.lineData) {
            setRedoStack(prevRedo => prevRedo.some(l => l.id === incomingData.targetId) ? prevRedo : [...prevRedo, incomingData.lineData]);
          }
          return;
        }

        if (incomingData.tool === 'redo') {
          setRedoStack(prevRedo => prevRedo.filter(line => line.id !== incomingData.targetId));
          setLines(prevLines => {
            if (prevLines.some(l => l.id === incomingData.targetId)) return prevLines;
            const restoredLine = { ...incomingData.lineData };
            if (restoredLine.tool === 'fill') restoredLine.imageObj = null; 
            return [...prevLines, restoredLine];
          });
          return;
        }

        if (incomingData.tool === 'delete_multiple') {
          setLines(prev => prev.filter(line => !incomingData.targetIds.includes(line.id)));
          return;
        }

        setRedoStack([]); 
        const actionForState = { ...incomingData, isLocal: false };
        if (actionForState.tool === 'fill') actionForState.imageObj = null; 
        
        setLines((prev) => {
          const existingIndex = prev.findIndex(l => l.id === actionForState.id && actionForState.id !== undefined);
          if (existingIndex !== -1) {
            const newLines = [...prev];
            newLines[existingIndex] = { 
              ...newLines[existingIndex], ...actionForState,
              imageObj: newLines[existingIndex].imageObj || actionForState.imageObj || null
            };
            return newLines;
          }
          return [...prev, actionForState];
        });
      });

    return () => {
      echo.leave(`board.${boardData.id}`);
      setActiveUsers([]);
    };
  }, [currentUser, boardData, setLines, setRedoStack, setBgImage]);

  // 4. Auto Save Loop
  useEffect(() => {
    if (!boardData?.id || boardData.id === 'temp') return;
    const autoSaveTimer = setTimeout(() => {
      const token = localStorage.getItem('auth_token');
      if(!token) return; 
      
      fetch(`${import.meta.env.VITE_API_URL}/boards/${boardData.id}/save-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ board_data: lines }) 
      }).catch(err => console.error("Lỗi auto-save:", err));
    }, 5000); 
    return () => clearTimeout(autoSaveTimer);
  }, [lines, boardData?.id]);


  const broadcastCursor = (x, y) => {
    if (!currentUser || !boardData || boardData.id === 'temp') return;
    
    echo.join(`board.${boardData.id}`).whisper('cursor-move', {
      userId: currentUser.id,
      name: currentUser.name,
      x: x,
      y: y
    });
  };

  return { boardData, currentUser, activeUsers, cursors, broadcastCursor };
};