import { useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export function useDragResize(
  position: Position,
  size: Size,
  onPositionChange: (p: Position) => void,
  onSizeChange: (s: Size) => void,
  options?: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number }
) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  const minW = options?.minWidth ?? 280;
  const minH = options?.minHeight ?? 160;
  const maxW = options?.maxWidth ?? window.innerWidth - 24;
  const maxH = options?.maxHeight ?? window.innerHeight - 48;

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: position.x,
        origY: position.y,
      };
    },
    [position.x, position.y]
  );

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origW: size.width,
        origH: size.height,
      };
    },
    [size.width, size.height]
  );

  useCallback(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        onPositionChange({
          x: Math.max(0, Math.min(window.innerWidth - size.width, dragRef.current.origX + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.origY + dy)),
        });
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        onSizeChange({
          width: Math.max(minW, Math.min(maxW, resizeRef.current.origW + dx)),
          height: Math.max(minH, Math.min(maxH, resizeRef.current.origH + dy)),
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [minW, minH, maxW, maxH, onPositionChange, onSizeChange, size.width]);

  // Attach listeners via effect in component instead - hook returns handlers only
  return { onDragStart, onResizeStart, dragRef, resizeRef };
}

/** Canvas-relative drag/resize (position from left/bottom within parent). */
export function useCanvasPanelDrag(
  position: { x: number; bottom: number },
  size: Size,
  onPositionChange: (p: { x: number; bottom: number }) => void,
  onSizeChange: (s: Size) => void,
  containerRef: React.RefObject<HTMLElement | null>,
  options?: { minWidth?: number; minHeight?: number }
) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origBottom: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const minW = options?.minWidth ?? 300;
  const minH = options?.minHeight ?? 140;

  const onDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origBottom: position.bottom,
    };
  };

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: size.width,
      origH: size.height,
    };
  };

  const attachListeners = () => {
    const onMove = (e: MouseEvent) => {
      const container = containerRef.current;
      const maxW = container ? container.clientWidth - 16 : 800;
      const maxH = container ? container.clientHeight - 16 : 400;

      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        onPositionChange({
          x: Math.max(0, Math.min(maxW - size.width, dragRef.current.origX + dx)),
          bottom: Math.max(8, Math.min(maxH - 60, dragRef.current.origBottom - dy)),
        });
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        onSizeChange({
          width: Math.max(minW, Math.min(maxW, resizeRef.current.origW + dx)),
          height: Math.max(minH, Math.min(maxH, resizeRef.current.origH + dy)),
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  };

  return { onDragStart, onResizeStart, attachListeners, dragRef, resizeRef };
}
