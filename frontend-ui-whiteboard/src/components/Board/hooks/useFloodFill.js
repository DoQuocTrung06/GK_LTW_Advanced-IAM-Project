import { useRef, useEffect } from 'react';
import { hexToRgb, matchColor } from '../utils/colorUtils';

export const useFloodFill = (stageRef, setLines, clearRedo, lines, linesRef) => {
  const fillingIdsRef = useRef(new Set());

  const performFloodFill = (startX, startY, color, lineId) => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const layer = stage.findOne('Layer');
    if (!layer || layer.getChildren().length === 0) return;

    const canvas = stage.toCanvas({ pixelRatio: 1 });
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

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
    if (startA === 0) return;

    const fillRGB = hexToRgb(color);
    if (!fillRGB) return;

    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b && startA === 255) return;

    const visited = new Uint8Array(width * height);
    const pixelStack = [[x, y]];

    while (pixelStack.length > 0) {
      const [nx, ny] = pixelStack.pop();
      const idx = ny * width + nx;

      if (visited[idx]) continue;
      visited[idx] = 1;

      const currentPixelPos = idx * 4;
      const cr = data[currentPixelPos];
      const cg = data[currentPixelPos + 1];
      const cb = data[currentPixelPos + 2];
      const ca = data[currentPixelPos + 3];

      
      if (!matchColor(cr, cg, cb, ca, startR, startG, startB, startA, 10)) continue;

      data[currentPixelPos] = fillRGB.r;
      data[currentPixelPos + 1] = fillRGB.g;
      data[currentPixelPos + 2] = fillRGB.b;
      data[currentPixelPos + 3] = 255;

      outputData[currentPixelPos] = fillRGB.r;
      outputData[currentPixelPos + 1] = fillRGB.g;
      outputData[currentPixelPos + 2] = fillRGB.b;
      outputData[currentPixelPos + 3] = 255;

      if (nx > 0) pixelStack.push([nx - 1, ny]);
      if (nx < width - 1) pixelStack.push([nx + 1, ny]);
      if (ny > 0) pixelStack.push([nx, ny - 1]);
      if (ny < height - 1) pixelStack.push([nx, ny + 1]);
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(outputImageData, 0, 0);

    const newFillImage = new window.Image();
    newFillImage.src = tempCanvas.toDataURL();
    newFillImage.onload = () => {
      setLines(prev => prev.map(line => {
        fillingIdsRef.current.delete(lineId);
        if (line.id === lineId) {
          return { ...line, imageObj: newFillImage };
        }
        return line;
      }));
      if (typeof clearRedo === 'function') clearRedo();
    };
  };

  useEffect(() => {
    const missingFillLines = lines.filter(
      (line) =>
        line.tool === 'fill' &&
        !line.imageObj &&
        !fillingIdsRef.current.has(line.id) &&
        (
          !line.relatedShapeId ||
          stageRef.current?.findOne(`#${line.relatedShapeId}`)
        )
    );

    if (missingFillLines.length === 0) return;

    missingFillLines.forEach((line) => {
      fillingIdsRef.current.add(line.id);
      requestAnimationFrame(() => {
        const currentLine = linesRef.current.find(l => l.id === line.id);
        if (currentLine?.imageObj) return;
        performFloodFill(line.startX, line.startY, line.color, line.id);
      });
    });
  }, [lines]);

  return { performFloodFill };
};