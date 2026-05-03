export const getCursorStyle = (tool, brushSize, zoomLevel) => {
  if (tool === 'eraser') {
    const size = brushSize * zoomLevel;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="white" stroke="black" stroke-width="1"/></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") ${size / 2} ${size / 2}, crosshair`;
  }
  
  if (tool === 'picker') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2L2 15v5h5L20 7M11 6l5 5"/></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 2 22, crosshair`;
  }

  if (tool === 'fill') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" stroke="white" stroke-width="5"/><path d="m5 2 5 5" stroke="white" stroke-width="5"/><path d="M2 13h15" stroke="white" stroke-width="5"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" stroke="white" stroke-width="5"/><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" stroke="black" stroke-width="2"/><path d="m5 2 5 5" stroke="black" stroke-width="2"/><path d="M2 13h15" stroke="black" stroke-width="2"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" stroke="black" stroke-width="2"/></svg>`;
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