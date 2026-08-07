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

  useEffect(() => setMounted(true), []);

  const pos = stepInspector.detachedPosition;

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setStepInspector({
        detachedPosition: {
          x: Math.max(0, dragRef.current.origX + dx),
          y: Math.max(0, dragRef.current.origY + dy),
        },
      });
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setStepInspector]);

  if (!mounted) return null;

  const panel = (
  <>
    <div
      className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-[1px]"
      onClick={pinned ? undefined : onClose}
    />
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'fixed z-[50] flex flex-col rounded-xl border border-cyan-500/25 shadow-2xl',
        'bg-slate-950/95 backdrop-blur-xl',
        maximized ? 'left-4 right-4 top-14 bottom-20' : 'w-[min(520px,calc(100vw-32px))] max-h-[min(72vh,640px)]'
      )}
      style={
        maximized
          ? undefined
          : {
              left: pos.x > 0 ? pos.x : undefined,
              right: pos.x > 0 ? undefined : 16,
              top: pos.y > 0 ? pos.y : 64,
            }
      }
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/15 bg-slate-900/80 cursor-grab active:cursor-grabbing shrink-0"
        onMouseDown={onHeaderMouseDown}
      >
        <div>
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
            {title} {pinned && '📌'}
          </span>
          <p className="text-[8px] text-slate-600">Drag header to move • Click outside to close</p>
        </div>
        <div className="flex gap-1">
          <ToolBtn onClick={onMaximize} title="Resize">{maximized ? '⊟' : '⬜'}</ToolBtn>
          <ToolBtn onClick={onPin} title="Pin">{pinned ? '📌' : '📍'}</ToolBtn>
          <ToolBtn onClick={onClose} title="Reattach">✕</ToolBtn>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar overscroll-contain">
        {children}
      </div>
    </motion.div>
  </>
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
