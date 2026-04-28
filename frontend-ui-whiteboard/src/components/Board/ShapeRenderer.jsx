import React from 'react';
// IMPORT THÊM THẺ Path TỪ REACT-KONVA
import { Line, Rect, Ellipse, Path, Text } from 'react-konva';

// ==========================================
// TỪ ĐIỂN HÌNH KHỐI (Dựa trên tỷ lệ ViewBox 24x24 của icon)
// ==========================================
// Đổi các thẻ <polygon> thành mã đường dẫn (Path - bắt đầu bằng M, nối bằng L, đóng bằng Z)
// Các hình phức tạp (Heart, Cloud...) giữ nguyên mã d="..."
const SHAPE_PATHS = {
  curve: "M4 12 Q 12 2 20 12",
  polygon: "M 12 4 L 4 10 L 7 20 L 17 20 L 20 10 Z",
  triangle: "M 12 4 L 4 20 L 20 20 Z",
  rightTriangle: "M 4 4 L 4 20 L 20 20 Z",
  diamond: "M 12 4 L 4 12 L 12 20 L 20 12 Z",
  hexagon: "M 12 4 L 4 8 L 4 16 L 12 20 L 20 16 L 20 8 Z",
  star: "M 12 2 L 15 9 L 22 9 L 16 14 L 18 21 L 12 17 L 6 21 L 8 14 L 2 9 L 9 9 Z",
  heart: "M12 21s-7-4.5-9-9c-2-5 3-9 7-5 4-4 9 0 7 5-2 4.5-9 9-9 9z",
  cloud: "M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 7 18z",
  cross: "M8 4h8v4h4v8h-4v4H8v-4H4V8h4z",
  moon: "M16 3a9 9 0 1 0 5 16A8 8 0 1 1 16 3z",
  lightning: "M 13 2 L 5 13 L 11 13 L 9 22 L 19 10 L 13 10 Z"
};

function ShapeRenderer({ shape }) {
 // 1. PEN, ERASER, PENCIL, HIGHLIGHTER
  if (
    shape.tool === 'pen' ||
    shape.tool === 'eraser' ||
    shape.tool === 'pencil' ||
    shape.tool === 'highlighter'
  ) {
    const isPencil = shape.tool === 'pencil';
    const isHighlighter = shape.tool === 'highlighter';
    const isEraser = shape.tool === 'eraser';

    return (
      <Line
        points={shape.points}

        stroke={
          isPencil ? '#777' : shape.color
        }

        strokeWidth={
          isHighlighter
            ? shape.size * 2.2
            : isPencil
            ? Math.max(1, shape.size * 0.6)
            : shape.size
        }

        opacity={
          isHighlighter
            ? 0.28
            : isPencil
            ? 0.38
            : 1
        }

        tension={
          isPencil ? 0 : 0.5
        }

        dash={
          isPencil ? [3, 3] : undefined
        }

        lineCap="round"
        lineJoin="round"

        shadowColor={
          isPencil ? '#999' : undefined
        }

        shadowBlur={
          isPencil ? 0.5 : 0
        }

        globalCompositeOperation={
          isEraser ? 'destination-out' : 'source-over'
        }
      />
    );
  }

  // 2. Đường thẳng
  if (shape.tool === 'line') {
    return (
      <Line
        points={shape.points}
        stroke={shape.color}
        strokeWidth={shape.size}
        tension={0}
        lineCap="round"
      />
    );
  }

  // 3. Hình chữ nhật / Chữ nhật bo góc
  if (shape.tool === 'rect' || shape.tool === 'roundRect') {
    return (
      <Rect
        x={shape.startX}
        y={shape.startY}
        width={shape.width}
        height={shape.height}
        stroke={shape.color}
        strokeWidth={shape.size}
        cornerRadius={shape.tool === 'roundRect' ? 10 : 0}
      />
    );
  }

  // 4. Hình Elip / Tròn
  if (shape.tool === 'oval') {
    return (
      <Ellipse
        x={shape.startX + shape.width / 2}
        y={shape.startY + shape.height / 2}
        radiusX={Math.abs(shape.width / 2)}
        radiusY={Math.abs(shape.height / 2)}
        stroke={shape.color}
        strokeWidth={shape.size}
      />
    );
  }

  if (shape.tool === 'text') {
    return (
      <Text
        x={shape.startX}
        y={shape.startY}
        text={shape.text}
        fill={shape.color} // Lưu ý: Text dùng fill để tô màu chữ, không dùng stroke
        fontSize={shape.size * 3} // Nhân lên để cỡ chữ tỷ lệ thuận với thanh brushSize
        fontFamily="Arial"
        draggable={true}
      />
    );
  }

  // 5. TOÀN BỘ CÁC HÌNH CÒN LẠI (Ngôi sao, Trái tim, Mây, Lục giác...)
  if (SHAPE_PATHS[shape.tool]) {
    // Vì icon gốc dùng tỷ lệ 24x24, ta sẽ scale chiều rộng/cao tương ứng với kéo chuột.
    const scaleX = shape.width / 24;
    const scaleY = shape.height / 24;
    
    return (
      <Path
        x={shape.startX}
        y={shape.startY}
        data={SHAPE_PATHS[shape.tool]}
        stroke={shape.color}
        strokeWidth={shape.size}
        scaleX={scaleX}
        scaleY={scaleY}
        // strokeScaleEnabled={false} giúp nét vẽ KHÔNG BỊ TO RA/MÉO ĐI khi bạn kéo hình quá lớn
        strokeScaleEnabled={false} 
      />
    );
  }

  return null;
}

export default ShapeRenderer;