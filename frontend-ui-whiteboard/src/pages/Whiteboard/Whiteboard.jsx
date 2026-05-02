import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../../components/Board/Board';
import Toolbar from '../../components/Toolbar/Toolbar';
import MenuStrip from '../../components/MenuStrip/MenuStrip'; 
import echo from '../../echo';
import ShareModal from '../../components/ShareModal/ShareModal';
import { toast } from 'react-toastify';

function Whiteboard() {

  

  // --- PHẦN 1: ROUTER VÀ DATA PHÒNG MỚI THÊM VÀO ---
  const { id } = useParams(); // Lấy ID phòng từ URL
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState({ 
    id: 'temp', 
    board_code: 'guest', 
    visibility: 'public' 
  });
  
  // THÊM: State lưu thông tin người dùng hiện tại
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const [lines, setLines] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const lastFetchedId = useRef(null);
  
  // --- PHẦN 2: GỌI API KHỞI TẠO HOẶC LẤY PHÒNG ---
  useEffect(() => {
    const fetchBoard = async () => {
      const currentIdToFetch = id || 'new';
      
      // Nếu ID này vừa được gọi rồi thì chặn lại ngay (Fix lỗi React Strict Mode tạo 2 phòng)
      if (lastFetchedId.current === currentIdToFetch) return;
      lastFetchedId.current = currentIdToFetch;

      const token = localStorage.getItem('auth_token');
      
      // Nếu không có token mà cố vào phòng riêng (không phải 'new'), báo lỗi
      if (!token && id !== 'new') {
        toast.error("Please login to access this board");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/boards/init/${currentIdToFetch}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error("Board not found");
            throw new Error("Server error");
        }

        const data = await response.json();
        setBoardData(data); // Lưu dữ liệu phòng vào state

        // Nếu là phòng mới tạo, đổi URL sang ID thật của phòng đó
        if (!id || id === 'new') {
          navigate(`/board/${data.id}`, { replace: true });
        }
      } catch (error) {
        console.error("Fetch board error:", error);
        toast.error(error.message);
        lastFetchedId.current = null; // Trả lại chốt chặn nếu bị lỗi
      }
    };

    fetchBoard();
  }, [id, navigate]);

  // --- PHẦN 3: KẾT NỐI REALTIME (SOCKET) ---
  useEffect(() => {
    // Chỉ kết nối nếu đã đăng nhập và có phòng thật (không phải 'temp')
    if (!currentUser || !boardData || boardData.id === 'temp') return;

    console.log("Connecting to presence channel:", boardData.id);

    // 1. NHÉT TOKEN VÀO ĐÂY ĐỂ VƯỢ QUA CỬA BẢO VỆ CỦA LARAVEL
    const token = localStorage.getItem('auth_token');
    if (token) {
      echo.connector.pusher.config.auth = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      };
    }

    // 2. BỎ CHỮ 'presence-' ĐI, CHỈ CẦN DÙNG 'board.'
    const channel = echo.join(`board.${boardData.id}`)
      .here((users) => {
        // Lấy danh sách những người đang có mặt khi bạn vừa vào
        setActiveUsers(users);
      })
      .joining((user) => {
        // Hiện thông báo và thêm người mới vào danh sách
        toast.success(`${user.name} joined the board`, { autoClose: 2000 });
        setActiveUsers((prev) => {
          // Tránh bị trùng lặp user trong mảng
          if (prev.find(u => u.id === user.id)) return prev;
          return [...prev, user];
        });
      })
      .leaving((user) => {
        // Hiện thông báo và xóa người đó khỏi danh sách
        toast.info(`${user.name} left the board`, { autoClose: 2000 });
        setActiveUsers((prev) => prev.filter(u => u.id !== user.id));
      })
      .listen('.draw.action', (e) => {
        const incomingData = e.actionData; 
        if (!incomingData) return;

        console.log("Realtime Action:", incomingData.tool);

        // 1. XỬ LÝ LỆNH CLEAR (THÙNG RÁC)
        if (incomingData.tool === 'clear') {
          setLines([]);
          setRedoStack([]);
          setBgImage(null);
          return; 
        }

        // 2. XỬ LÝ LỆNH UNDO TỪ NGƯỜI KHÁC
        if (incomingData.tool === 'undo') {
          setLines((prevLines) => {
            const lineToUndo = prevLines.find(line => line.id === incomingData.targetId);
            if (lineToUndo) {
              // Dùng setTimeout để luồng setRedoStack không xung đột với setLines
              setTimeout(() => {
                setRedoStack((prevRedo) => [...prevRedo, lineToUndo]);
              }, 0);
            }
            // Xóa nét đó khỏi màn hình
            return prevLines.filter(line => line.id !== incomingData.targetId);
          });
          return;
        }

        // 3. XỬ LÝ LỆNH REDO TỪ NGƯỜI KHÁC
        if (incomingData.tool === 'redo') {
          setRedoStack((prevRedo) => prevRedo.filter(line => line.id !== incomingData.targetId));
          
          setLines((prevLines) => {
            const isExist = prevLines.find(l => l.id === incomingData.targetId);
            if (isExist) return prevLines;

            // --- FIX Ở ĐÂY: Chắc chắn rằng nét fill đến từ Redo bị ép về null imageObj ---
            const restoredLine = { ...incomingData.lineData };
            if (restoredLine.tool === 'fill') {
              restoredLine.imageObj = null; 
            }

            return [...prevLines, restoredLine];
          });
          return;
        }

        // 4. XỬ LÝ VẼ NÉT MỚI HOÀN TOÀN
        // ĐIỂM CHỐT FIX LỖI: Bất cứ khi nào có ai đó vẽ một nét mới, phải DỌN SẠCH thùng rác Redo!
        setRedoStack([]); 

        const actionForState = { ...incomingData, isLocal: false };
        setLines((prev) => {
          const isExist = prev.find(l => l.id === actionForState.id && actionForState.id !== undefined);
          if (isExist) return prev;
          return [...prev, actionForState];
        });
      });

    // Hàm dọn dẹp: Ngắt kết nối khi rời khỏi bảng hoặc tắt web
    return () => {
      console.log("Leaving channel...");
      // 3. BỎ CHỮ 'presence-' Ở ĐÂY NỮA
      echo.leave(`board.${boardData.id}`);
      setActiveUsers([]);
    };
  }, [currentUser, boardData]); // Chạy lại mỗi khi user hoặc board thay đổi


  const [redoStack, setRedoStack] = useState([]);

  const [clipboard, setClipboard] = useState(null);
  const [canPaste, setCanPaste] = useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [bgImage, setBgImage] = useState(null);

  const [lastSavedData, setLastSavedData] = useState({ lines: [], bgImage: null });
  const hasUnsavedChanges = lines !== lastSavedData.lines || bgImage !== lastSavedData.bgImage;
  
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);


  const handleNewBoard = () => {
    window.open('/', '_blank'); 
  };

  // 1. Hàm này kích hoạt khi bấm nút Thùng rác (Chỉ bật Modal hỏi, chưa xóa vội)
  const handleTrashClick = () => {
    setIsClearModalOpen(true);
  };

  // 2. Hàm này thực thi việc dọn dẹp và phát sóng (Broadcast)
  const executeClearBoard = () => {
    // Dọn dẹp máy client
    const emptyLines = [];
    setLines(emptyLines);
    setRedoStack([]);
    setBgImage(null);
    setLastSavedData({ lines: emptyLines, bgImage: null });

    // Phát sóng lệnh 'clear' cho các client khác
    const token = localStorage.getItem('auth_token');
    if (token && boardData?.id && boardData.id !== 'temp') {
      fetch(`http://localhost:8000/api/boards/${boardData.id}/broadcast-draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          actionData: { tool: 'clear', id: Date.now() } 
        })
      }).catch(err => console.error("Broadcast clear error:", err));
    }

    // Đóng Modal sau khi xóa xong
    setIsClearModalOpen(false);
  };

  const handleUndo = () => {
    // Nếu không có nét nào để xóa thì dừng luôn
    if (lines.length === 0) return;
    
    // 1. Lấy nét vẽ cuối cùng ra (Dùng state lines hiện tại)
    const lastLine = lines[lines.length - 1];

    // 2. Cập nhật State ĐỘC LẬP với nhau
    setRedoStack((prevRedo) => [...prevRedo, lastLine]); // Bỏ vào thùng rác Redo
    setLines((prevLines) => prevLines.slice(0, -1));     // Xóa nét cuối trên bảng

    // 3. Gọi API phát sóng (Side effect - Phải nằm NGOÀI setState)
    const token = localStorage.getItem('auth_token');
    if (token && boardData?.id && boardData.id !== 'temp' && lastLine.id) {
      fetch(`http://localhost:8000/api/boards/${boardData.id}/broadcast-draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          actionData: { tool: 'undo', targetId: lastLine.id } 
        })
      }).catch(err => console.error("Broadcast undo error:", err));
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const lineToRestore = redoStack[redoStack.length - 1];

    setLines((prevLines) => [...prevLines, lineToRestore]);
    setRedoStack((prevRedo) => prevRedo.slice(0, -1));

    // --- FIX Ở ĐÂY: Tẩy sạch imageObj trước khi đóng gói gửi đi ---
    const dataToSend = { ...lineToRestore };
    if (dataToSend.tool === 'fill') {
      dataToSend.imageObj = null; // Ép về null để máy kia phải tự fill lại
    }

    const token = localStorage.getItem('auth_token');
    if (token && boardData?.id && boardData.id !== 'temp' && lineToRestore) {
      fetch(`http://localhost:8000/api/boards/${boardData.id}/broadcast-draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          // Truyền dataToSend thay vì lineToRestore nguyên bản
          actionData: { tool: 'redo', targetId: lineToRestore.id, lineData: dataToSend } 
        })
      }).catch(err => console.error("Broadcast redo error:", err));
    }
  };

// Phóng to (Mỗi lần tăng 25%, tối đa 300%)
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  // Thu nhỏ (Mỗi lần giảm 25%, tối thiểu 25%)
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => setZoomLevel(1);



  const handleSave = async () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();

   
    if ('showSaveFilePicker' in window) {
      try {
        
        const handle = await window.showSaveFilePicker({
          suggestedName: 'my-drawing.png',
          types: [{
            description: 'PNG Image',
            accept: { 'image/png': ['.png'] },
          }],
        });

       
        const response = await fetch(uri);
        const blob = await response.blob();

        
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();

        
        console.log("File saved successfully!");
        setLastSavedData({ lines: lines, bgImage: bgImage });
      } catch (err) {
       
        console.log("Save cancelled or error:", err);
      }
    } else {
      const link = document.createElement('a');
      link.download = 'my-drawing.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLastSavedData({ lines: lines, bgImage: bgImage });
    }
  };
  


  // THÊM HÀM XỬ LÝ CHIA SẺ (SHARE)
  const handleShare = () => {
    // Chỉ đơn giản là bật State mở Modal lên
    setIsShareModalOpen(true);
  };

  // THÊM HÀM XỬ LÝ MỞ TỆP CHỌN TỪ MÁY
  const handleOpen = () => {
    fileInputRef.current.click(); // Kích hoạt nút bấm chọn file
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = event.target.result;
        const emptyLines = [];
        
        setBgImage(newImage); 
        setLines(emptyLines); 
        setRedoStack([]);
        
        // Đặt lại cột mốc cho file mới mở
        setLastSavedData({ lines: emptyLines, bgImage: newImage });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };


// Logic xử lý cho menu Edit
  const handleCopy = async () => {
  if (!stageRef.current) return;

  try {
    const uri = stageRef.current.toDataURL();
    const response = await fetch(uri);
    const blob = await response.blob();

    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);

    setCanPaste(true);
  } catch (error) {
    console.error("Copy error:", error);
  }
};

const handleCut = async () => {
  await handleCopy();
  handleClearAll();
};

const handlePaste = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read();

    for (const clipboardItem of clipboardItems) {
      if (
        clipboardItem.types.includes("image/png") ||
        clipboardItem.types.includes("image/jpeg")
      ) {
        const type = clipboardItem.types.includes("image/png")
          ? "image/png"
          : "image/jpeg";

        const blob = await clipboardItem.getType(type);
        const url = URL.createObjectURL(blob);

        setBgImage(url);
        setLines([]);
        setRedoStack([]);
        return;
      }
    }
  } catch (err) {
    console.error("Paste error:", err);
  }
};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* THẺ INPUT ẨN ĐỂ CHỌN FILE */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />

      {/* 1. Thanh Menu và Thao tác nhanh trên cùng */}
      <MenuStrip 
        currentUser={currentUser} // Truyền thông tin user để MenuStrip tự xử lý chặn
        activeUsers={activeUsers}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNew={handleNewBoard}
        onOpen={handleOpen}
        onCut={handleCut}    
        onCopy={handleCopy} 
        onPaste={handlePaste} 
        canPaste={canPaste}
        onZoomIn={handleZoomIn}      
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onShare={handleShare} // Truyền trực tiếp hàm handleShare gốc
        canUndo={lines.length > 0}
        canRedo={redoStack.length > 0}
        hasUnsavedChanges={hasUnsavedChanges}
        boardCreatorId={boardData.owner_id}
      />

      {/* 2. Thanh Ribbon chứa công cụ */}
      <Toolbar 
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        onClearAll={handleTrashClick}
      />
      
      {/* 3. Khu vực chứa tờ giấy vẽ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Board 
          boardId={boardData.id} lines={lines} setLines={setLines}
          tool={tool} 
          color={color} 
          brushSize={brushSize}
          stageRef={stageRef}
          clearRedo={() => setRedoStack([])} 
          zoomLevel={zoomLevel}
          bgImage={bgImage}
          setColor={setColor}
        />
      </div>

      {/* GỌI MODAL Ở ĐÂY */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        boardId={boardData.id} 
        currentVisibility={boardData.visibility || "private"}
      />


      {/* MODAL CẢNH BÁO XÓA BẢNG (XỊN SÒ HƠN WINDOW.CONFIRM) */}
      {isClearModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '4px solid #ef4444' }}>
            <h3 className="modal-title" style={{ color: '#ef4444' }}>Clear Entire Board?</h3>
            <p className="modal-text">
              Are you sure you want to clear everything?<br/>
              This will immediately remove drawings for <b>all connected users</b> and cannot be undone.
            </p>
            <div className="modal-buttons">
              <button 
                className="modal-btn btn-primary" 
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} 
                onClick={executeClearBoard}
              >
                Yes, Clear It
              </button>
              <button 
                className="modal-btn btn-secondary" 
                onClick={() => setIsClearModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default Whiteboard;