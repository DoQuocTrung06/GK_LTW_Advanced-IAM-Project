import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import echo from '../../../echo'; // Đường dẫn trỏ về file echo.js ở thư mục src

export const useBoardSync = (id, lines, setLines, setRedoStack, setBgImage) => {
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState({ id: 'temp', board_code: 'guest', visibility: 'public' });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const lastFetchedId = useRef(null);

  // 1. Lấy thông tin user
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } 
      catch (e) { console.error("Failed to parse user data"); }
    }
  }, []);

  // 2. Fetch API khởi tạo phòng
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

        // Xử lý lỗi 401: Token hết hạn hoặc chưa đăng nhập
        if (response.status === 401) {
          toast.warning("Session expired or unauthorized. Please login.");
          localStorage.removeItem('auth_token');
          navigate('/login');
          return;
        }

        // Xử lý lỗi 403: Không có quyền truy cập bảng (Bảng Private của người khác)
        if (response.status === 403) {
          toast.error("Access denied. You don't have permission to view this board.");
          navigate('/');
          return;
        }

        // Dòng code cũ của bạn giữ nguyên
        if (!response.ok) throw new Error(response.status === 404 ? "Board not found" : "Server error");

        const data = await response.json();
        setBoardData(data);

        // Load nét vẽ cũ
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

  // 3. Kết nối Socket Realtime
  useEffect(() => {
    if (!currentUser || !boardData || boardData.id === 'temp') return;

    const token = localStorage.getItem('auth_token');
    if (token) {
      echo.connector.pusher.config.auth = {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      };
    }

    echo.join(`board.${boardData.id}`)
      .here((users) => setActiveUsers(users))
      .joining((user) => {
        toast.success(`${user.name} joined the board`, { autoClose: 2000 });
        setActiveUsers((prev) => prev.find(u => u.id === user.id) ? prev : [...prev, user]);
      })
      .leaving((user) => {
        toast.info(`${user.name} left the board`, { autoClose: 2000 });
        setActiveUsers((prev) => prev.filter(u => u.id !== user.id));
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
      fetch(`${import.meta.env.VITE_API_URL}/boards/${boardData.id}/save-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ board_data: lines }) 
      }).catch(err => console.error("Lỗi auto-save:", err));
    }, 2000); 
    return () => clearTimeout(autoSaveTimer);
  }, [lines, boardData?.id]);

  return { boardData, currentUser, activeUsers };
};