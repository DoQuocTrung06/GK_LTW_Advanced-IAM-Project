import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import './Board.css';
import ShapeRenderer from './ShapeRenderer';

// --- HÀM HỖ TRỢ THUẬT TOÁN ĐỔ MÀU (Nằm ngoài component) ---
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

const matchColor = (r1, g1, b1, a1, r2, g2, b2, a2, tolerance) => {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance &&
    Math.abs(a1 - a2) <= tolerance
  );
};

function Board({ boardId, lines, setLines, tool, color, setColor, brushSize, stageRef, clearRedo, zoomLevel = 1, bgImage }) {
  const isDrawing = useRef(false);  

  const [paperSize, setPaperSize] = useState({ width: 800, height: 600 });
  const [activeTextInput, setActiveTextInput] = useState(null);
  
  

  const paperRef = useRef(null);
  const resizing = useRef(null); 
  const [imageObj, setImageObj] = useState(null);

  // XỬ LÝ KHI NGƯỜI DÙNG MỞ ẢNH TỪ MÁY
  useEffect(() => {
    if (bgImage) {
      const img = new window.Image();
      img.src = bgImage;
      img.onload = () => {
        setImageObj(img);
        setPaperSize({ width: img.width, height: img.height });
        
      };
    } else {
      setImageObj(null);
      setPaperSize({ width: 1100, height: 600 }); 
      
    }
  }, [bgImage]);

  

  const rgbToHex = (r, g, b) => {
    return ((r << 16) | (g << 8) | b).toString(16);
  };

  // THÊM THAM SỐ lineId VÀO HÀM
  const performFloodFill = (startX, startY, overrideColor = null, lineId) => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const canvas = stage.toCanvas({ pixelRatio: 1 });
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // TẠO MỘT LỚP ẢNH TRONG SUỐT ĐỂ LƯU RIÊNG MÀU FILL
    const outputImageData = ctx.createImageData(width, height);
    const outputData = outputImageData.data;

    const x = Math.round(startX);
    const y = Math.round(startY);

    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const startPos = (y * width + x) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    const fillRGB = hexToRgb(overrideColor || color);
    if (!fillRGB) return;

    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b && startA === 255) return;

    const pixelStack = [[x, y]];

    while (pixelStack.length > 0) {
      const [nx, ny] = pixelStack.pop();
      const currentPixelPos = (ny * width + nx) * 4;

      const cr = data[currentPixelPos];
      const cg = data[currentPixelPos + 1];
      const cb = data[currentPixelPos + 2];
      const ca = data[currentPixelPos + 3];

      if (matchColor(cr, cg, cb, ca, startR, startG, startB, startA, 30)) {
        // Đánh dấu vào ảnh gốc để thuật toán quét tiếp
        data[currentPixelPos] = fillRGB.r;
        data[currentPixelPos + 1] = fillRGB.g;
        data[currentPixelPos + 2] = fillRGB.b;
        data[currentPixelPos + 3] = 255;

        // CHỈ GHI MÀU VÀO LỚP ẢNH OUTPUT TRONG SUỐT
        outputData[currentPixelPos] = fillRGB.r;
        outputData[currentPixelPos + 1] = fillRGB.g;
        outputData[currentPixelPos + 2] = fillRGB.b;
        outputData[currentPixelPos + 3] = 255;

        if (nx > 0) pixelStack.push([nx - 1, ny]);
        if (nx < width - 1) pixelStack.push([nx + 1, ny]);
        if (ny > 0) pixelStack.push([nx, ny - 1]);
        if (ny < height - 1) pixelStack.push([nx, ny + 1]);
      }
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Chỉ in lớp màu fill ra canvas
    tempCtx.putImageData(outputImageData, 0, 0);

    const newFillImage = new window.Image();
    newFillImage.src = tempCanvas.toDataURL();
    newFillImage.onload = () => {
      // TÌM ĐÚNG LỆNH FILL ĐÓ TRONG MẢNG VÀ GẮN ẢNH VÀO
      setLines(prev => prev.map(line => {
        if (line.id === lineId) {
          return { ...line, imageObj: newFillImage };
        }
        return line;
      }));
      if (typeof clearRedo === 'function') clearRedo();
    };
  };


  // HÀM GỬI DỮ LIỆU LÊN SERVER
  const broadcastData = (actionData) => {
    const token = localStorage.getItem('auth_token');
    if (token && boardId !== 'temp') {
      fetch(`http://localhost:8000/api/boards/${boardId}/broadcast-draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actionData })
      }).catch(err => console.error("Broadcast error:", err));
    }
  };

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const actualX = pos.x / zoomLevel;
    const actualY = pos.y / zoomLevel;

    // --- 1. LOGIC TEXT ---
    if (tool === 'text') {
      if (activeTextInput) handleTextBlur(); 
      setActiveTextInput({ startX: actualX, startY: actualY, value: '' });
      isDrawing.current = false; 
      return;
    }

    // --- 2. LOGIC ĐỔ MÀU (THÙNG SƠN) ---
    if (tool === 'fill') {
      const fillLineId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
      const fillAction = {
        id: fillLineId,
        tool: 'fill',
        color: color,
        startX: actualX,
        startY: actualY,
        isLocal: true
      };
      
      // Khai báo sự tồn tại của nét vẽ trước
      setLines((prev) => [...prev, fillAction]);
      broadcastData(fillAction);
      
      // Delay 50ms để React vẽ xong các nét khác, sau đó mới quét màu
      setTimeout(() => {
        performFloodFill(actualX, actualY, color, fillLineId);
      }, 50);
      
      isDrawing.current = false;
      return;
    }

    isDrawing.current = true;

    // --- 3. LOGIC COLOR PICKER ---
    if (tool === 'picker') {
      const ctx = stage.toCanvas().getContext('2d');
      const pixelData = ctx.getImageData(pos.x, pos.y, 1, 1).data; 
      const hexColor = "#" + ("000000" + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);
      
      if (typeof setColor === 'function') setColor(hexColor);
      isDrawing.current = false;
      return;
    }

    // --- 4. LOGIC VẼ (LINES & SHAPES) ---
    // Tạo ID siêu ngẫu nhiên để không bao giờ bị trùng khi Socket bắn về
    const newLineId = Date.now().toString() + Math.random().toString(36).substring(2, 7);

    // Luôn dùng (prev) để đảm bảo không dính nét cũ khi click quá nhanh
    setLines((prev) => {
      if (tool === 'pen' || tool === 'eraser' || tool === 'pencil' || tool === 'highlighter') {
        return [...prev, { id: newLineId, tool, color, size: brushSize, points: [actualX, actualY] }];
      } 
      else if (tool === 'line') {
        return [...prev, { id: newLineId, tool, color, size: brushSize, points: [actualX, actualY, actualX, actualY] }];
      }
      else {
        return [...prev, { id: newLineId, tool, color, size: brushSize, startX: actualX, startY: actualY, width: 0, height: 0 }];
      }
    });
    
    if (typeof clearRedo === 'function') clearRedo();
  };

  const handleTextBlur = () => {
    if (activeTextInput && activeTextInput.value.trim() !== '') {
      const textAction = { 
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7), // Thêm ID
        tool: 'text', 
        text: activeTextInput.value, 
        color: color, 
        size: brushSize, 
        startX: activeTextInput.startX, 
        startY: activeTextInput.startY 
      };
      
      setLines((prev) => [...prev, textAction]);
      broadcastData(textAction); 
      
      if (typeof clearRedo === 'function') clearRedo();
    }
    setActiveTextInput(null); 
  };
 
  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    const actualX = pos.x / zoomLevel;
    const actualY = pos.y / zoomLevel;

    // Dùng callback (prev) để luôn lấy được dữ liệu vẽ mới nhất, ko bị bóng ma của React chèn vào
    setLines((prev) => {
      if (prev.length === 0) return prev;
      
      const newLines = [...prev];
      let lastLine = { ...newLines[newLines.length - 1] };

      if (tool === 'pen' || tool === 'eraser' || tool === 'pencil' || tool === 'highlighter') {
        lastLine.points = lastLine.points.concat([actualX, actualY]);
      } 
      else if (tool === 'line') {
        lastLine.points = [lastLine.points[0], lastLine.points[1], actualX, actualY];
      }
      else {
        lastLine.width = actualX - lastLine.startX;
        lastLine.height = actualY - lastLine.startY;
      }
      
      newLines[newLines.length - 1] = lastLine;
      return newLines;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    // Mượn prev state để đọc nét vẽ cuối cùng đảm bảo không bị trễ nhịp
    setLines((prev) => {
      const lastLine = prev[prev.length - 1];
      if (lastLine) {
        const actionWithLocalFlag = { ...lastLine, isLocal: true };
        broadcastData(actionWithLocalFlag);
      }
      return prev; // Trả về y nguyên, không thay đổi state
    });

    if (clearRedo) clearRedo();
  };

  // ==========================================
  // LOGIC KÉO GIÃN TỜ GIẤY (RESIZE)
  // ==========================================
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
      const newWidth = (e.clientX - rect.left) / zoomLevel;
      setPaperSize(prev => ({ ...prev, width: Math.max(200, newWidth) })); 
    }
    if (resizing.current === 'bottom' || resizing.current === 'corner') {
      const newHeight = (e.clientY - rect.top) / zoomLevel;
      setPaperSize(prev => ({ ...prev, height: Math.max(200, newHeight) }));
    }
  };

  const handleResizeEnd = () => {
    resizing.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // ==========================================
  // XỬ LÝ CON TRỎ CHUỘT (POINTER / CURSOR)
  // ==========================================
  const getCursorStyle = () => {
    if (tool === 'eraser') {
      const size = brushSize * zoomLevel;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="white" stroke="black" stroke-width="1"/></svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") ${size / 2} ${size / 2}, crosshair`;
    }
    
    if (tool === 'picker') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2L2 15v5h5L20 7M11 6l5 5"/></svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 2 22, crosshair`;
    }

    // MỚI: Icon Thùng sơn (Paint Bucket)
    if (tool === 'fill') {
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round">

        <!-- Viền trắng dày phía sau -->
        <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"
              stroke="white"
              stroke-width="5"/>

        <path d="m5 2 5 5"
              stroke="white"
              stroke-width="5"/>

        <path d="M2 13h15"
              stroke="white"
              stroke-width="5"/>

        <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"
              stroke="white"
              stroke-width="5"/>

        <!-- Icon gốc màu đen đè lên trên -->
        <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"
              stroke="black"
              stroke-width="2"/>

        <path d="m5 2 5 5"
              stroke="black"
              stroke-width="2"/>

        <path d="M2 13h15"
              stroke="black"
              stroke-width="2"/>

        <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"
              stroke="black"
              stroke-width="2"/>
      </svg>
      `;

      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 2 22, crosshair`;
    }

    if (tool === 'pen' || tool === 'pencil' || tool === 'highlighter') { 
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 2 22, crosshair`;
    }

    if (tool === 'text') return 'text';
    if (tool === 'select') return 'default'; 
    return 'crosshair'; 
  };
  
  // Lắng nghe để tự động vẽ lại màu cho các lệnh Fill (bao gồm cả Redo và Socket)
  useEffect(() => {
    // Tìm tất cả các nét fill chưa có imageObj
    const missingFillLines = lines.filter(
      (line) => line.tool === 'fill' && !line.imageObj
    );

    if (missingFillLines.length > 0) {
      // Chạy qua từng nét để tái tạo lại màu
      missingFillLines.forEach((line) => {
        // Delay một chút để đảm bảo Canvas đã render các nét vẽ trước đó
        setTimeout(() => {
          performFloodFill(line.startX, line.startY, line.color, line.id);
        }, 50);
      });
    }
  }, [lines]); // Mỗi khi Undo/Redo làm mảng lines thay đổi, nó sẽ tự kiểm tra

  // ==========================================
  // GIAO DIỆN
  // ==========================================
  return (
    <div className="board-workspace">
      <div 
        className="paper-wrapper" 
        ref={paperRef}
        style={{ 
          width: paperSize.width * zoomLevel, 
          height: paperSize.height * zoomLevel,
          position: 'relative'
        }}
      >
        <Stage
          width={paperSize.width * zoomLevel}
          height={paperSize.height * zoomLevel}
          scaleX={zoomLevel} 
          scaleY={zoomLevel} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          ref={stageRef}
          style={{ cursor: getCursorStyle() }}
        >
          <Layer>
            <Rect
              x={0} y={0}
              width={paperSize.width}
              height={paperSize.height}
              fill="#ffffff"
            />

            {imageObj && <KonvaImage image={imageObj} x={0} y={0} />}
            
            {/* RENDER MẢNG DRAWING & FILL */}
            {lines.map((shape, i) => {
              // Nếu nó là lệnh Fill, hãy lấy bức ảnh trong suốt ra render
              if (shape.tool === 'fill') {
                return shape.imageObj ? (
                  <KonvaImage 
                    key={shape.id || i} 
                    image={shape.imageObj} 
                    x={0} y={0} 
                    listening={false} 
                  />
                ) : null;
              }
              // Các công cụ khác vẽ bình thường
              return <ShapeRenderer key={shape.id || i} shape={shape} />;
            })}
          </Layer>
        </Stage>

        {activeTextInput && (
          <textarea
            ref={(el) => {
              if (el) setTimeout(() => el.focus(), 0);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            value={activeTextInput.value}
            onChange={(e) =>
              setActiveTextInput({
                ...activeTextInput,
                value: e.target.value
              })
            }
            onBlur={handleTextBlur}
            style={{
              position: 'absolute',
              top: `${activeTextInput.startY * zoomLevel}px`,
              left: `${activeTextInput.startX * zoomLevel}px`,
              fontSize: `${brushSize * 3 * zoomLevel}px`,
              color: color,
              background: 'transparent',
              border: '1px dashed #000',
              outline: 'none',
              resize: 'both',
              zIndex: 9999
            }}
          />
        )}

        <div className="resize-handle handle-right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
        <div className="resize-handle handle-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
        <div className="resize-handle handle-corner" onMouseDown={(e) => handleResizeStart(e, 'corner')} />
      </div>
    </div>
  );
}

export default Board;