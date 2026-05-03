import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Board from '../../components/Board/Board';
import Toolbar from '../../components/Toolbar/Toolbar';
import MenuStrip from '../../components/MenuStrip/MenuStrip'; 
import ShareModal from '../../components/ShareModal/ShareModal';

// Gọi 3 Custom Hooks
import { useClipboard } from "../../components/Board/hooks/useClipboard";
import { useBoardSync } from "../../components/Board/hooks/useBoardSync";
import { useBoardTools } from "../../components/Board/hooks/useBoardTools";

function Whiteboard() {
  const { id } = useParams(); 
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  // States cơ bản của bảng vẽ
  const [lines, setLines] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [bgImage, setBgImage] = useState(null);
  const [tool, setTool] = useState('pen');

  useEffect(() => {
    setSelectedItemIds([]);
  }, [tool]);


  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  
  // UI States (Modals)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // --- KẾT NỐI CÁC LOGIC HOOKS ---
  const { boardData, currentUser, activeUsers } = useBoardSync(
    id, lines, setLines, setRedoStack, setBgImage
  );

  const tools = useBoardTools({
    lines, setLines, redoStack, setRedoStack, bgImage, setBgImage, boardData, stageRef
  });

  const clipboard = useClipboard({
    lines, setLines, selectedItemIds, setSelectedItemIds, tool, boardData, stageRef
  });

  // Helper cho Menu
  const handleNewBoard = () => window.open('/', '_blank'); 
  const handleOpenLocalFile = () => fileInputRef.current.click(); 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      <input 
        type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} 
        onChange={tools.handleFileChange} 
      />

      <MenuStrip 
        currentUser={currentUser} activeUsers={activeUsers}
        boardCreatorId={boardData.owner_id} hasUnsavedChanges={tools.hasUnsavedChanges}
        canUndo={lines.length > 0} canRedo={redoStack.length > 0}
        canPaste={clipboard.canPaste}
        
        onSave={tools.handleSave} onNew={handleNewBoard} onOpen={handleOpenLocalFile}
        onUndo={tools.handleUndo} onRedo={tools.handleRedo}
        onCut={clipboard.handleCut} onCopy={clipboard.handleCopy} onPaste={clipboard.handlePaste} 
        onZoomIn={tools.handleZoomIn} onZoomOut={tools.handleZoomOut} onResetZoom={tools.handleResetZoom}
        onShare={() => setIsShareModalOpen(true)} 
      />

      <Toolbar 
        tool={tool} setTool={setTool} color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        onClearAll={() => setIsClearModalOpen(true)}
      />
      
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Board 
          boardId={boardData.id} lines={lines} setLines={setLines}
          tool={tool} color={color} brushSize={brushSize}
          stageRef={stageRef} clearRedo={() => setRedoStack([])} 
          zoomLevel={tools.zoomLevel} bgImage={bgImage} setColor={setColor}
          selectedItemIds={selectedItemIds} setSelectedItemIds={setSelectedItemIds}
        />
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} 
        boardId={boardData.id} currentVisibility={boardData.visibility || "private"}
      />

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
                className="modal-btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} 
                onClick={() => { tools.executeClearBoard(); setIsClearModalOpen(false); }}
              >Yes, Clear It</button>
              <button className="modal-btn btn-secondary" onClick={() => setIsClearModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Whiteboard;