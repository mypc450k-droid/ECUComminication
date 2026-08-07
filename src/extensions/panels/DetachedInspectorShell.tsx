'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useExtensionStore } from '../store/extensionStore';
import { cn } from '@/lib/utils';

interface DetachedInspectorShellProps {
  title: string;
  pinned: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onPin: () => void;
  onMaximize: () => void;
  maximized: boolean;
}

export function DetachedInspectorShell({
  title,
  pinned,
  children,
  onClose,
  onPin,
  onMaximize,
  maximized,
}: DetachedInspectorShellProps) {
  const [mounted, setMounted] = useState(false);
  const stepInspector = useExtensionStore((s) => s.stepInspector);
  const setStepInspector = useExtensionStore((s) => s.setStepInspector);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const pos = stepInspector.detachedPosition;
  const size = stepInspector.detachedSize;

  const displaySize = maximized
    ? { width: Math.min(window.innerWidth - 32, 900), height: Math.min(window.innerHeight - 120, 720) }
    : size;

  const displayPos = maximized
    ? {
        x: Math.max(16, (window.innerWidth - displaySize.width) / 2),
        y: Math.max(56, (window.innerHeight - displaySize.height) / 2 - 20),
      }
    : pos.x > 0 || pos.y > 0
      ? pos
      : { x: Math.max(16, window.innerWidth - displaySize.width - 16), y: 64 };

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: displayPos.x,
      origY: displayPos.y,
    };
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: displaySize.width,
      origH: displaySize.height,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setStepInspector({
          detachedPosition: {
            x: Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.origX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.origY + dy)),
          },
          maximized: false,
        });
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setStepInspector({
          detachedSize: {
            width: Math.max(320, Math.min(window.innerWidth - 24, resizeRef.current.origW + dx)),
            height: Math.max(200, Math.min(window.innerHeight - 48, resizeRef.current.origH + dy)),
          },
          maximized: false,
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
  }, [setStepInspector]);

  if (!mounted) return null;

  const panel = (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'fixed z-[50] flex flex-col rounded-xl border border-cyan-500/25 shadow-2xl',
        'bg-slate-950/95 backdrop-blur-xl pointer-events-auto'
      )}
      style={{
        left: displayPos.x,
        top: displayPos.y,
        width: displaySize.width,
        height: displaySize.height,
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/15 bg-slate-900/80 cursor-grab active:cursor-grabbing shrink-0 select-none"
        onMouseDown={onHeaderMouseDown}
      >
        <div>
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
            {title} {pinned && '📌'}
          </span>
          <p className="text-[8px] text-slate-600">Drag to move • Corner to resize • UI stays interactive</p>
        </div>
        <div className="flex gap-1">
          <ToolBtn onClick={onMaximize} title={maximized ? 'Restore size' : 'Enlarge'}>
            {maximized ? '⊟' : '⬜'}
          </ToolBtn>
          <ToolBtn onClick={onPin} title="Pin">{pinned ? '📌' : '📍'}</ToolBtn>
          <ToolBtn onClick={onClose} title="Reattach">✕</ToolBtn>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar overscroll-contain">
        {children}
      </div>
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
        title="Resize"
      >
        <svg viewBox="0 0 16 16" className="w-4 h-4 text-slate-600">
          <path d="M14 14L14 8M14 14L8 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </motion.div>
  );

  return createPortal(panel, document.body);
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="text-[10px] text-slate-500 hover:text-cyan-400 px-1.5 py-0.5 rounded hover:bg-slate-800/60"
    >
      {children}
    </button>
  );
}
