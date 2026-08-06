'use client';

import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

export function GlassPanel({ children, className, highlighted, onClick }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-lg',
        highlighted && 'glass-panel-highlight',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
