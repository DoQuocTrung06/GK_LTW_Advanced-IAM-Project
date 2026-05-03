import React, { useState } from 'react';
import './Toolbar.css';


function Toolbar({ tool, setTool, color, setColor, brushSize, setBrushSize, onClearAll }) {
  const [showBrushMenu, setShowBrushMenu] = useState(false);
  const row1Colors = ['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4'];
  const row2Colors = ['#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'];

  // Đã thêm onClick cho các shapes
  const shapes = [
    { id: 'line', icon: <line x1="4" y1="20" x2="20" y2="4"/> },
    { id: 'curve', icon: <path d="M4 12 Q 12 2 20 12"/> },
    { id: 'oval', icon: <ellipse cx="12" cy="12" rx="8" ry="6"/> },
    { id: 'rect', icon: <rect x="4" y="6" width="16" height="12"/> },
    { id: 'roundRect', icon: <rect x="4" y="6" width="16" height="12" rx="4" ry="4"/> },
    { id: 'polygon', icon: <polygon points="12,4 4,10 7,20 17,20 20,10"/> },
    { id: 'triangle', icon: <polygon points="12,4 4,20 20,20"/> },
    { id: 'rightTriangle', icon: <polygon points="4,4 4,20 20,20"/> },
    { id: 'diamond', icon: <polygon points="12,4 4,12 12,20 20,12"/> },
    { id: 'hexagon', icon: <polygon points="12,4 4,8 4,16 12,20 20,16 20,8"/> },
    { id: 'star', icon: <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"/> },
    { id: 'heart', icon: <path d="M12 21s-7-4.5-9-9c-2-5 3-9 7-5 4-4 9 0 7 5-2 4.5-9 9-9 9z"/> },
    { id: 'cloud', icon: <path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 7 18z"/> },
    { id: 'cross', icon: <path d="M8 4h8v4h4v8h-4v4H8v-4H4V8h4z"/> },

    { id: 'moon', icon: <path d="M16 3a9 9 0 1 0 5 16A8 8 0 1 1 16 3z"/> },

    { id: 'lightning', icon: <polygon points="13,2 5,13 11,13 9,22 19,10 13,10"/> },
  ];

  return (
    <div className="ribbon-container">
      
      {/* 1. TOOLS */}
      <div className="ribbon-section">
        <div className="tools-grid">

          <button className={`tool-btn ${tool === 'select' ? 'active' : ''}`} onClick={() => setTool('select')} title="Select Object">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
              <path d="M13 13l6 6"></path>
            </svg>
          </button>

          <button className={`tool-btn ${tool === 'pen' ? 'active' : ''}`} onClick={() => setTool('pen')} title="Pencil">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
          </button>
          
          <button className={`tool-btn ${tool === 'fill' ? 'active' : ''}`} onClick={() => setTool('fill')} title="Fill with color">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19.38 5.62l-1.42 1.42-6.59-6.59L2 9.78l12.22 12.22 6.58-6.59-1.42-1.42M14.22 22l-1.41-1.41M19.38 5.62A3 3 0 0 1 21 8c0 1.66-1.5 3-3 3s-3-1.34-3-3a3 3 0 0 1 1.62-2.38"></path></svg>
          </button>

          <button className={`tool-btn ${tool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')} title="Text">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
          </button>

          <button className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title="Eraser">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20H20V20Z"></path><path d="M17 6L6 17"></path></svg>
          </button>

          <button className={`tool-btn ${tool === 'picker' ? 'active' : ''}`} onClick={() => setTool('picker')} title="Color Picker">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2L2 15v5h5L20 7M11 6l5 5"></path></svg>
          </button>

          <button className="tool-btn" onClick={onClearAll} title="Clear Canvas">
             <svg viewBox="0 0 24 24" fill="none" stroke="#d9534f" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
        <span className="section-label">Tools</span>
      </div>

      {/* 2. BRUSHES */}
      <div className="ribbon-section">
        {/* Container phải có relative để menu con định vị chính xác */}
        <div 
          className={`brush-container ${tool === 'pen' || tool === 'pencil' || tool === 'highlighter' ? 'active' : ''}`} 
          onClick={() => setShowBrushMenu(!showBrushMenu)}
          style={{ position: 'relative' }} 
        >
          <div className="big-tool-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 20h3l13-13a2 2 0 0 0-3-3L2 17v3z"></path><path d="M14 4l3 3"></path><path d="M4 16l3 3"></path></svg>
          </div>
          <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          
          {/* BRUSH MENU DROPDOWN */}
          {showBrushMenu && (
            <div className="brush-dropdown">

              <button
                className="brush-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setTool('pen');
                  setShowBrushMenu(false);
                }}
              >
                <span>Pen</span>
                <div className="brush-stroke pen"></div>
              </button>

              <button
                className="brush-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setTool('pencil');
                  setShowBrushMenu(false);
                }}
              >
                <span>Pencil</span>
                <div className="brush-stroke pencil"></div>
              </button>

              <button
                className="brush-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setTool('highlighter');
                  setShowBrushMenu(false);
                }}
              >
                <span>Highlighter</span>
                <div className="brush-stroke highlighter"></div>
              </button>

            </div>
          )}
        </div>
        <span className="section-label">Brushes</span>
      </div>

      {/* 3. SHAPES (Bảng hình khối) */}
      <div className="ribbon-section">
        <div className="shapes-panel">
          {shapes.map(shape => (
            <button 
              key={shape.id} 
              className={`shape-btn ${tool === shape.id ? 'active' : ''}`} 
              onClick={() => setTool(shape.id)} 
              title={shape.id}
              style={{ backgroundColor: tool === shape.id ? '#cce8ff' : 'transparent', border: tool === shape.id ? '1px solid #99d1ff' : '1px solid transparent' }}
            >
               <svg viewBox="0 0 24 24" strokeWidth="1.5">{shape.icon}</svg>
            </button>
          ))}
        </div>
        <span className="section-label">Shapes</span>
      </div>

      {/* 4. SIZE */}
      <div className="ribbon-section">
        <div className="size-container">
          <input 
            type="range" min="1" max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))} 
            className="size-slider"
          />
          <div className="size-preview-wrapper">
             <div 
               className="size-preview" 
               style={{ 
                 height: `${Math.min(brushSize, 32)}px`, 
                 width: `${Math.min(brushSize, 32)}px`, 
                 backgroundColor: tool === 'eraser' ? '#ccc' : color 
               }}>
             </div>
          </div>
        </div>
        <span className="section-label">Size</span>
      </div>

      {/* 5. COLORS */}
      <div className="ribbon-section" style={{ flexDirection: 'row' }}>
        <div className="colors-container">
          
          <div className="active-color-box selected">
            <div className="current-color-circle" style={{ backgroundColor: color }}></div>
            <span style={{fontSize: '11px', color: '#333'}}>Color 1</span>
          </div>

          <div className="color-palette-wrapper">
            <div className="color-palette" style={{ marginBottom: '5px' }}>
              {row1Colors.map((c) => (
                <button key={c} className={`color-swatch ${color === c ? 'selected' : ''}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} disabled={tool === 'eraser'} title={c} />
              ))}
            </div>
            <div className="color-palette">
              {row2Colors.map((c) => (
                <button key={c} className={`color-swatch ${color === c ? 'selected' : ''}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} disabled={tool === 'eraser'} title={c} />
              ))}
            </div>
          </div>

          <div className="color-picker-wrapper">
            <div className="color-picker-btn">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={tool === 'eraser'} title="Edit colors"/>
            </div>
            <span style={{fontSize: '11px', color: '#606060', marginTop: '6px'}}>Edit colors</span>
          </div>

        </div>
        <div style={{width: '100%', position: 'absolute', bottom: '0', textAlign: 'center'}}>
           <span className="section-label">Colors</span>
        </div>
      </div>

    </div>
  );
}

export default Toolbar;