import { useState, useRef, useEffect } from 'react';
import Board from '../../components/Board/Board';
import Toolbar from '../../components/Toolbar/Toolbar';
import MenuStrip from '../../components/MenuStrip/MenuStrip'; 

function Whiteboard() {
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
  const [redoStack, setRedoStack] = useState([]);

  const [clipboard, setClipboard] = useState(null);
  const [canPaste, setCanPaste] = useState(false);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [bgImage, setBgImage] = useState(null);

  const [lastSavedData, setLastSavedData] = useState({ lines: [], bgImage: null });
  const hasUnsavedChanges = lines !== lastSavedData.lines || bgImage !== lastSavedData.bgImage;
  
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleClearAll = () => {
    const emptyLines = [];
    setLines(emptyLines);
    setRedoStack([]);
    setBgImage(null);
    
    // Đặt lại cột mốc (vì mở file mới là trắng tinh, tính là đã lưu)
    setLastSavedData({ lines: emptyLines, bgImage: null });   
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    const lastLine = lines[lines.length - 1];
    setRedoStack([...redoStack, lastLine]);
    setLines(lines.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lineToRestore = redoStack[redoStack.length - 1];
    setLines([...lines, lineToRestore]);
    setRedoStack(redoStack.slice(0, -1));
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
  const handleShare = async () => {
  if (!stageRef.current) return;

  const uri = stageRef.current.toDataURL();

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], 'my-drawing.png', { type: 'image/png' });

    // Kiểm tra xem trình duyệt có thực sự hỗ trợ share file không
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My Drawing',
        text: 'Check out my drawing! (If the image is missing, please paste it below)',
      });
    } else {
      // Fallback: Copy image to clipboard
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      
      // Thông báo rõ ràng để người dùng biết phải Paste
      alert("Browser doesn't support direct file sharing. The image has been COPIED to your clipboard. Just press Ctrl+V in your email to attach it!");
    }
  } catch (error) {
    console.error("Sharing failed:", error);
  }
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
        currentUser={currentUser}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNew={handleClearAll}
        onOpen={handleOpen}
        onCut={handleCut}    
        onCopy={handleCopy} 
        onPaste={handlePaste} 
        canPaste={canPaste}
        onZoomIn={handleZoomIn}      
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onShare={handleShare}
        canUndo={lines.length > 0}
        canRedo={redoStack.length > 0}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 2. Thanh Ribbon chứa công cụ */}
      <Toolbar 
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        onClearAll={handleClearAll}
      />
      
      {/* 3. Khu vực chứa tờ giấy vẽ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Board 
          lines={lines} setLines={setLines}
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
      
    </div>
  );
}

export default Whiteboard;