import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
import './Board.css';
import ShapeRenderer from './ShapeRenderer';

// Các Import từ việc tách file
import { rgbToHex } from './utils/colorUtils';
import { getCursorStyle } from './utils/cursorUtils';
import { useBoardResize } from './hooks/useBoardResize';
import { useFloodFill } from './hooks/useFloodFill';
import LiveCursors from './LiveCursors'

function Board({ 
    boardId, lines, setLines, tool, color, setColor, brushSize, stageRef, 
    clearRedo, zoomLevel = 1, bgImage, selectedItemIds, setSelectedItemIds,
    // 1. THÊM 2 PROPS NÀY VÀO CUỐI:
    cursors, broadcastCursor, canDraw
  }) {
  const isDrawing = useRef(false);  
  const trRef = useRef(null);
  const lastCursorTime = useRef(0);
  const dragNodesStart = useRef({});
  const selectedItemIdsRef = useRef(selectedItemIds);
  const linesRef = useRef(lines);

  const [selectionBox, setSelectionBox] = useState(null);
  const [dragOverlay, setDragOverlay] = useState(null); 
  const [activeTextInput, setActiveTextInput] = useState(null);
  const [imageObj, setImageObj] = useState(null);

  // Hook thu phóng giấy
  const { paperSize, setPaperSize, paperRef, handleResizeStart } = useBoardResize(zoomLevel);
  // Hook đổ mực
  const { performFloodFill } = useFloodFill(stageRef, setLines, clearRedo, lines, linesRef);

  const processedFillIds = useRef(new Set());

  useEffect(() => {
    // Dọn ID của shape đã bị xóa khỏi Set
    const currentIds = new Set(lines.map(l => l.id));
    processedFillIds.current.forEach(id => {
      if (!currentIds.has(id)) processedFillIds.current.delete(id);
    });

    // Tìm fill chưa có imageObj (paste hoặc nhận từ socket)
    const fillsNeedingRender = lines.filter(
      line =>
        line.tool === 'fill' &&
        !line.imageObj &&
        line.startX !== undefined &&
        !processedFillIds.current.has(line.id)
    );

    fillsNeedingRender.forEach((fill) => {
      processedFillIds.current.add(fill.id);

      requestAnimationFrame(() => {
        performFloodFill(fill.startX, fill.startY, fill.color, fill.id);
      });
    });
  }, [lines]);

  useEffect(() => {
    selectedItemIdsRef.current = selectedItemIds;
  }, [selectedItemIds]);

  useEffect(() => {          
    linesRef.current = lines;
  }, [lines]);

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
  }, [bgImage, setPaperSize]);

  const broadcastData = (actionData) => {
    const token = localStorage.getItem('auth_token');
    if (token && boardId !== 'temp') {
      const dataToSend = { ...actionData };
      delete dataToSend.imageObj; 

      fetch(`http://localhost:8000/api/boards/${boardId}/broadcast-draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actionData: dataToSend })
      }).catch(err => console.error("Broadcast error:", err));
    }
  };

  const handleGroupDragStart = (e) => {
    const draggedId = e.target.id(); 
    let currentIds = selectedItemIdsRef.current || [];

    // Ensure family (outline + fill) is deeply linked when dragging starts
    if (draggedId !== 'drag-overlay' && !currentIds.includes(draggedId)) {
      const family = new Set([draggedId]);
      let changed = true;
      while(changed) {
        changed = false;
        let size = family.size;
        linesRef.current.forEach(line => {
          if (family.has(line.id) && line.relatedShapeId && !family.has(line.relatedShapeId)) family.add(line.relatedShapeId);
          if (line.relatedShapeId && family.has(line.relatedShapeId) && !family.has(line.id)) family.add(line.id);
        });
        if (family.size > size) changed = true;
      }
      currentIds = Array.from(family);
      if (typeof setSelectedItemIds === 'function') setSelectedItemIds(currentIds);
    }

    dragNodesStart.current = {
      startX: e.target.x(),
      startY: e.target.y(),
      nodes: currentIds.map(id => {
        const node = stageRef.current.findOne(`#${id}`);
        return { id, x: node?.x() || 0, y: node?.y() || 0 };
      })
    };
  };

  const handleGroupDragMove = (e) => {
    const startData = dragNodesStart.current;
    if (!startData || !startData.nodes) return;

    const dx = e.target.x() - startData.startX;
    const dy = e.target.y() - startData.startY;

    startData.nodes.forEach(item => {
      if (item.id === e.target.id()) return;
      const node = stageRef.current.findOne(`#${item.id}`);
      if (node) {
        node.x(item.x + dx);
        node.y(item.y + dy);
      }
    });
  };

  const handleGroupDragEnd = (e) => {
    const startData = dragNodesStart.current;
    if (!startData || !startData.nodes) return;

    const dx = e.target.x() - startData.startX;
    const dy = e.target.y() - startData.startY;

    let itemsToBroadcast = [];
    setLines(prev => prev.map(line => {
      const startItem = startData.nodes.find(n => n.id === line.id);
      if (startItem) {
        const updated = { ...line, x: startItem.x + dx, y: startItem.y + dy };
        itemsToBroadcast.push(updated);
        return updated;
      }
      return line;
    }));

    if (e.target.id() === 'drag-overlay') {
      setDragOverlay(prev => prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null);
    }

    setTimeout(() => {
      itemsToBroadcast.forEach(item => broadcastData({ ...item, isLocal: true }));
    }, 0);
  };

  // HÀM MỚI: Gom cả họ hàng Viền + Màu khi click vào 1 trong 2
  const handleSelectShape = (id) => {
    const family = new Set([id]);
    let changed = true;
    while(changed) {
      changed = false;
      let size = family.size;
      lines.forEach(l => {
        if (family.has(l.id) && l.relatedShapeId && !family.has(l.relatedShapeId)) family.add(l.relatedShapeId);
        if (l.relatedShapeId && family.has(l.relatedShapeId) && !family.has(l.id)) family.add(l.id);
      });
      if (family.size > size) changed = true;
    }
    if (typeof setSelectedItemIds === 'function') setSelectedItemIds(Array.from(family));
  };

  const handleStageMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedItemIds([]);
    }
  };

  const handleMouseDown = (e) => {
    if (!canDraw) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const actualX = pos.x / zoomLevel;
    const actualY = pos.y / zoomLevel;

    if (tool === 'select') {
      const clickedOnEmpty = e.target === stage || e.target.name() === 'bg-rect';
      if (clickedOnEmpty) {
        if (typeof setSelectedItemIds === 'function') setSelectedItemIds([]);
        setSelectionBox({ x1: actualX, y1: actualY, x2: actualX, y2: actualY, visible: true });
      }
      return; 
    }

    if (tool === 'text') {
      if (activeTextInput) handleTextBlur(); 
      setActiveTextInput({ startX: actualX, startY: actualY, value: '' });
      isDrawing.current = false; 
      return;
    }

    if (tool === 'fill') {
      const targetId = e.target.id(); 
      const fillLineId = "shape_" + Date.now().toString() + Math.random().toString(36).substring(2, 7);
      
      const fillAction = {
        id: fillLineId,
        tool: 'fill',
        color: color,
        startX: actualX,
        startY: actualY,
        isLocal: true,
        relatedShapeId: (targetId && targetId !== 'bg-rect' && targetId !== '') ? targetId : null 
      };
      
      setLines((prev) => [...prev, fillAction]);
      broadcastData(fillAction);
      
      requestAnimationFrame(() => {
        performFloodFill(actualX, actualY, color, fillLineId);
      });
      isDrawing.current = false;
      return;
    }

    isDrawing.current = true;

    if (tool === 'picker') {
      const ctx = stage.toCanvas().getContext('2d');
      const pixelData = ctx.getImageData(pos.x, pos.y, 1, 1).data; 
      const hexColor = "#" + ("000000" + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);
      
      if (typeof setColor === 'function') setColor(hexColor);
      isDrawing.current = false;
      return;
    }

    const newLineId = "shape_" + Date.now().toString() + Math.random().toString(36).substring(2, 7);
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
        id: "shape_" + Date.now().toString() + Math.random().toString(36).substring(2, 7),
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
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const actualX = pos.x / zoomLevel;
    const actualY = pos.y / zoomLevel;

    // Gửi tọa độ cho người khác (mỗi 50 mili-giây gửi 1 lần cho nhẹ máy)
    const now = Date.now();
    if (now - lastCursorTime.current > 50) {
      if (typeof broadcastCursor === 'function') {
        broadcastCursor(actualX, actualY);
      }
      lastCursorTime.current = now;
    }
    if (!canDraw) return;

    if (tool === 'select' && selectionBox && selectionBox.visible) {
      setSelectionBox(prev => ({ ...prev, x2: actualX, y2: actualY }));
      return;
    }
    if (!isDrawing.current) return;

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
    if (!canDraw) return;
    if (tool === 'select' && selectionBox && selectionBox.visible) {
      setSelectionBox(null); 
      
      const selNode = stageRef.current.findOne('#selection-rect');
      if (selNode) {
        const box = selNode.getClientRect();
        let initialSelectedIds = [];
        
        lines.forEach(line => {
          const node = stageRef.current.findOne(`#${line.id}`);
          if (node && Konva.Util.haveIntersection(box, node.getClientRect())) {
            initialSelectedIds.push(line.id);
          }
        });
        
        let finalSelectedIds = new Set(initialSelectedIds);
        lines.forEach(line => {
          if (line.relatedShapeId && finalSelectedIds.has(line.relatedShapeId)) finalSelectedIds.add(line.id);
          if (finalSelectedIds.has(line.id) && line.relatedShapeId) finalSelectedIds.add(line.relatedShapeId);
        });
        
        if(typeof setSelectedItemIds === 'function') setSelectedItemIds(Array.from(finalSelectedIds));
      }
      return;
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    setLines((prev) => {
      const lastLine = prev[prev.length - 1];
      if (lastLine) {
        broadcastData({ ...lastLine, isLocal: true });
      }
      return prev; 
    });

    if (clearRedo) clearRedo();
  };

  useEffect(() => {
    if (!stageRef.current || !trRef.current) return;

    if (tool !== 'select') {
      trRef.current.nodes([]);
      setDragOverlay(null); 
      return;
    }

    if (selectedItemIds && selectedItemIds.length > 0) {
      const nodes = selectedItemIds
        .map(id => stageRef.current.findOne(`#${id}`))
        .filter(node => {
            if (!node) return false;
            const shapeData = lines.find(l => l.id === node.id());
            return !(shapeData && shapeData.tool === 'fill');
          });
      
      trRef.current.nodes(nodes); 
      trRef.current.getLayer().batchDraw(); 

      if (nodes.length > 0) {
        const box = trRef.current.getClientRect();
        const stage = stageRef.current;
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert(); 
        const topLeft = transform.point({ x: box.x, y: box.y });

        setDragOverlay({
          x: topLeft.x,
          y: topLeft.y,
          width: box.width / stage.scaleX(),
          height: box.height / stage.scaleY()
        });
      }
    } else {
      trRef.current.nodes([]); 
      setDragOverlay(null); 
    }
  }, [selectedItemIds, tool, lines]);

  return (
    <div className="board-workspace">
      <div className="paper-wrapper" ref={paperRef} style={{ width: paperSize.width * zoomLevel, height: paperSize.height * zoomLevel, position: 'relative' }}>
        <Stage
          width={paperSize.width * zoomLevel}
          height={paperSize.height * zoomLevel}
          scaleX={zoomLevel} 
          scaleY={zoomLevel} 
          onMouseDown={(e) => {
            handleStageMouseDown(e);  // clear select khi click ngoài
            handleMouseDown(e);       // logic vẽ/select cũ
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          ref={stageRef}
          style={{ cursor: canDraw ? getCursorStyle(tool, brushSize, zoomLevel) : 'not-allowed' }}
          
        >
          <Layer>
            <Rect name="bg-rect" x={0} y={0} width={paperSize.width} height={paperSize.height} fill="#ffffff" />
            {imageObj && <KonvaImage image={imageObj} x={0} y={0} />}
            
            {lines.map((shape, i) => {
              if (shape.tool === 'fill') {
                const isValidImage = shape.imageObj && (shape.imageObj instanceof window.Image || shape.imageObj instanceof window.HTMLCanvasElement);
                return isValidImage ? (
                  <KonvaImage 
                    key={shape.id || i} 
                    id={shape.id} name="canvas-object" image={shape.imageObj} 
                    x={shape.x || 0} y={shape.y || 0}
                    scaleX={shape.scaleX || 1}
                    scaleY={shape.scaleY || 1}
                    rotation={shape.rotation || 0}
                    draggable={tool === 'select'} 
                    onDragStart={handleGroupDragStart} onDragMove={handleGroupDragMove} onDragEnd={handleGroupDragEnd}
                    // ✅ FIX 2: Thêm sự kiện Click để trỏ chuột nhấp vào MÀU là tự chộp luôn cả VIỀN
                    onMouseDown={(e) => {
                      if (tool === 'select') {
                        e.cancelBubble = true; // Chặn không cho click xuyên xuống nền
                        handleSelectShape(shape.id);
                      }
                    }}
                    onTouchStart={(e) => {
                      if (tool === 'select') {
                        e.cancelBubble = true;
                        handleSelectShape(shape.id);
                      }
                    }}
                  />
                ) : null;
              }
              return (
                <ShapeRenderer 
                  key={shape.id || i} 
                  shape={shape} 
                  currentTool={tool}
                  onSelect={(id) => {
                    // Force selecting both Outline and Fill when clicked directly
                    const family = new Set([id]);
                    let changed = true;
                    while(changed) {
                      changed = false;
                      let size = family.size;
                      lines.forEach(l => {
                        if (family.has(l.id) && l.relatedShapeId && !family.has(l.relatedShapeId)) family.add(l.relatedShapeId);
                        if (l.relatedShapeId && family.has(l.relatedShapeId) && !family.has(l.id)) family.add(l.id);
                      });
                      if (family.size > size) changed = true;
                    }
                    if (typeof setSelectedItemIds === 'function') setSelectedItemIds(Array.from(family));
                  }}
                  onChange={(updated) => setLines(prev => prev.map(l => l.id === updated.id ? updated : l))}
                  onDragStart={handleGroupDragStart} 
                  onDragMove={handleGroupDragMove} 
                  onDragEnd={handleGroupDragEnd}
                />
              );
            })}
            
            {selectionBox && selectionBox.visible && (
              <Rect id="selection-rect" x={Math.min(selectionBox.x1, selectionBox.x2)} y={Math.min(selectionBox.y1, selectionBox.y2)} width={Math.abs(selectionBox.x1 - selectionBox.x2)} height={Math.abs(selectionBox.y1 - selectionBox.y2)} fill="rgba(0, 161, 255, 0.3)" stroke="#00A1FF" strokeWidth={1} listening={false} />
            )}

            {dragOverlay && tool === 'select' && (
              <Rect id="drag-overlay" x={dragOverlay.x} y={dragOverlay.y} width={dragOverlay.width} height={dragOverlay.height} fill="transparent" draggable onDragStart={handleGroupDragStart} onDragMove={handleGroupDragMove} onDragEnd={handleGroupDragEnd} />
            )}

            <Transformer 
              ref={trRef} 
              onTransformEnd={(e) => {
                const activeNodes = trRef.current.nodes(); 

                const updatedLines = lines.map(line => {
                  // 1. If line is the directly transformed outline
                  const activeNode = activeNodes.find(n => n.id() === line.id);
                  if (activeNode) {
                    const newLine = { ...line, x: activeNode.x(), y: activeNode.y(), scaleX: activeNode.scaleX(), scaleY: activeNode.scaleY(), rotation: activeNode.rotation() };
                    broadcastData({ ...newLine, isLocal: true });
                    return newLine;
                  }

                  // 2. CRITICAL FIX: If line is a FILL related to the transformed outline
                  if (line.relatedShapeId) {
                    const parentNode = activeNodes.find(n => n.id() === line.relatedShapeId);
                    if (parentNode) {
                      // Apply the EXACT same transform metrics to the fill shape
                      const newLine = { ...line, x: parentNode.x(), y: parentNode.y(), scaleX: parentNode.scaleX(), scaleY: parentNode.scaleY(), rotation: parentNode.rotation() };
                      broadcastData({ ...newLine, isLocal: true });
                      return newLine;
                    }
                  }
                  
                  return line;
                });
                setLines(updatedLines);
              }}
              boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox}
            />
          </Layer>
          <LiveCursors cursors={cursors} />
        </Stage>

        {activeTextInput && (
          <textarea
            ref={(el) => { if (el) setTimeout(() => el.focus(), 0); }}
            onMouseDown={(e) => e.stopPropagation()}
            value={activeTextInput.value}
            onChange={(e) => setActiveTextInput({ ...activeTextInput, value: e.target.value })}
            onBlur={handleTextBlur}
            style={{ position: 'absolute', top: `${activeTextInput.startY * zoomLevel}px`, left: `${activeTextInput.startX * zoomLevel}px`, fontSize: `${brushSize * 3 * zoomLevel}px`, color: color, background: 'transparent', border: '1px dashed #000', outline: 'none', resize: 'both', zIndex: 9999 }}
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