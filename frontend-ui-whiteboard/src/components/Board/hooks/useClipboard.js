import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import echo from '../../../echo';

export const useClipboard = ({
  lines,
  setLines,
  selectedItemIds,
  setSelectedItemIds,
  boardData,
  stageRef
}) => {
  const [clipboard, setClipboard] = useState(null);
  const [canPaste, setCanPaste] = useState(false);

  const linesRef = useRef(lines);
  const selectedRef = useRef(selectedItemIds);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useEffect(() => {
    selectedRef.current = selectedItemIds;
  }, [selectedItemIds]);

  const getFullSelection = (baseIds, allLines) => {
    if (!baseIds || baseIds.length === 0) return [];

    let fullIds = new Set(baseIds.map(id => String(id)));
    let changed = true;

    while (changed) {
      changed = false;
      let size = fullIds.size;

      allLines.forEach(line => {
        const id = String(line.id);
        const related = line.relatedShapeId ? String(line.relatedShapeId) : null;

        if (fullIds.has(id) && related && !fullIds.has(related)) {
          fullIds.add(related);
        }
        if (related && fullIds.has(related) && !fullIds.has(id)) {
          fullIds.add(id);
        }
      });

      if (fullIds.size > size) changed = true;
    }

    return Array.from(fullIds);
  };

  const handleCopy = async () => {
    const currentLines = linesRef.current || [];
    const currentSelectedIds = selectedRef.current || [];

    if (currentLines.length === 0) {
      toast.info("Bảng trống");
      return;
    }

    let items = [];

    if (currentSelectedIds.length > 0) {
      const ids = getFullSelection(currentSelectedIds, currentLines);
      items = currentLines.filter(l => ids.includes(String(l.id)));
    } else {
      items = currentLines;
    }

    if (items.length === 0) {
      toast.info("Không có gì để copy");
      return;
    }

    const cloned = items.map(item => {
      const c = { ...item };
      
      return c;
    });

    setClipboard({ items: cloned, type: 'copy' });
    setCanPaste(true);

    toast.success(currentSelectedIds.length > 0 ? "Đã copy vùng chọn" : "Đã copy toàn bộ");

    if (stageRef?.current) {
      try {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const blob = await (await fetch(uri)).blob();
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch {}
    }
  };

  const handleCut = () => {
    const currentLines = linesRef.current || [];
    const currentSelectedIds = selectedRef.current || [];

    if (currentLines.length === 0) {
      toast.info("Bảng trống");
      return;
    }

    let items = [];

    if (currentSelectedIds.length > 0) {
      const ids = getFullSelection(currentSelectedIds, currentLines);
      items = currentLines.filter(l => ids.includes(String(l.id)));
    } else {
      items = currentLines;
    }

    if (items.length === 0) return;

    const idsToCut = items.map(l => String(l.id));

    const cloned = items.map(item => {
      const c = { ...item };
      
      return c;
    });

    setClipboard({ items: cloned, type: 'cut' });
    setCanPaste(true);

    setLines(prev => prev.filter(l => !idsToCut.includes(String(l.id))));
    setSelectedItemIds([]);

    broadcast({ tool: 'delete_multiple', targetIds: idsToCut });

    toast.success(currentSelectedIds.length > 0 ? "Đã cut vùng chọn" : "Đã cut toàn bộ");
  };

  const handlePaste = () => {
    if (!clipboard?.items?.length) return;

    const idMap = {};
    const t = Date.now();

    clipboard.items.forEach(i => {
      idMap[String(i.id)] = `p_${t}_${Math.random().toString(36).slice(2, 6)}`;
    });

    const newItems = clipboard.items.map(i => {
      const oldId = String(i.id);
      const oldRel = i.relatedShapeId ? String(i.relatedShapeId) : null;

      const n = {
        ...i,
        id: idMap[oldId],
        relatedShapeId: oldRel ? idMap[oldRel] : null
      };

      if (n.tool === 'fill') {
        n.imageObj = null;
      }

      return n;
    });

    setLines(prev => [...prev, ...newItems]);
    setSelectedItemIds(newItems.map(i => i.id));

    // Thay thế vòng lặp broadcast cũ trong handlePaste bằng đoạn này
    newItems.forEach(i => {
      const itemToBroadcast = { ...i, isLocal: true };
      if (itemToBroadcast.tool === 'fill') {
        itemToBroadcast.imageObj = null; // Chỉ xóa khi gửi qua mạng
      }
      broadcast(itemToBroadcast);
    });

    if (clipboard.type === 'cut') {
      setClipboard(null);
      setCanPaste(false);
    }

    toast.success("Đã dán");
  };

  const broadcast = (actionData) => {
    const token = localStorage.getItem('auth_token');
    if (!token || !boardData?.id || boardData.id === 'temp') return;

    fetch(`http://localhost:8000/api/boards/${boardData.id}/broadcast-draw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Socket-ID': echo.socketId()
      },
      body: JSON.stringify({ actionData })
    }).catch(() => {});
  };

  return { handleCopy, handleCut, handlePaste, canPaste };
};