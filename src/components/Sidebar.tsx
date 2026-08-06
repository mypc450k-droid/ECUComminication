'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { sidebarItems } from '@/lib/data';
import { searchAll } from '@/lib/data';
import type { SidebarItem } from '@/types';
import { cn } from '@/lib/utils';

function SidebarNode({
  item,
  depth = 0,
}: {
  item: SidebarItem;
  depth?: number;
}) {
  const expandedSidebar = useAppStore((s) => s.expandedSidebar);
  const toggleSidebarExpand = useAppStore((s) => s.toggleSidebarExpand);
  const selectFeature = useAppStore((s) => s.selectFeature);
  const selectAutosarLayer = useAppStore((s) => s.selectAutosarLayer);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const highlightedIds = useAppStore((s) => s.highlightedIds);
  const searchQuery = useAppStore((s) => s.searchQuery);

  const isExpanded = expandedSidebar.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;

  const isHighlighted =
    item.featureId && highlightedIds.includes(item.featureId) ||
    (searchQuery && item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleClick = () => {
    if (item.type === 'mode' && item.id === 'autosar-mode') {
      setViewMode('autosar');
      selectAutosarLayer('app-layer');
      return;
    }
    if (item.type === 'feature' && item.featureId) {
      selectFeature(item.featureId);
      return;
    }
    if (hasChildren) {
      toggleSidebarExpand(item.id);
    }
  };

  const icons: Record<string, string> = {
    vehicle: '⬡',
    body: '▣',
    powertrain: '⚙',
    chassis: '◈',
    adas: '◎',
    comfort: '◉',
    infotainment: '▦',
    safety: '⚠',
    diagnostics: '⚡',
    autosar: '⬢',
    iso26262: '◆',
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-1.5 text-left transition-all duration-200 rounded-md',
          'hover:bg-cyan-500/10 hover:text-cyan-300',
          depth === 0 ? 'text-xs font-semibold text-slate-300' : 'text-xs text-slate-400',
          selectedFeatureId === item.featureId && 'bg-cyan-500/15 text-cyan-300',
          isHighlighted && 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20'
        )}
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        {hasChildren && (
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="text-[10px] text-slate-500 w-3"
          >
            ▶
          </motion.span>
        )}
        {!hasChildren && depth > 0 && (
          <span className="w-3 h-3 flex items-center justify-center text-[8px] text-slate-600">●</span>
        )}
        {depth === 0 && (
          <span className="text-[11px] text-cyan-500/70">{icons[item.id] || '◈'}</span>
        )}
        <span className="truncate">{item.label}</span>
      </button>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children!.map((child) => (
              <SidebarNode key={child.id} item={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setHighlightedIds = useAppStore((s) => s.setHighlightedIds);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalQuery(value);
      setSearchQuery(value);
      if (value.trim()) {
        const results = searchAll(value);
        const ids = [...results.ecuIds, ...results.featureIds, ...results.networkIds];
        setHighlightedIds(ids);
      } else {
        setHighlightedIds([]);
      }
    },
    [setSearchQuery, setHighlightedIds]
  );

  useEffect(() => {
  }, []);

  return (
    <aside className="flex flex-col h-full w-56 border-r border-cyan-500/10 bg-slate-900/40">
      <div className="p-3 border-b border-cyan-500/10">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search ECUs, features..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800/60 border border-slate-700/50 rounded-md
              text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40
              focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {sidebarItems.map((item) => (
          <SidebarNode key={item.id} item={item} />
        ))}
      </nav>

      <div className="p-3 border-t border-cyan-500/10">
        <div className="text-[10px] text-slate-500 font-mono">
          <div className="flex justify-between">
            <span>ECUs</span>
            <span className="text-cyan-400">29</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span>Networks</span>
            <span className="text-cyan-400">5</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span>Features</span>
            <span className="text-cyan-400">18</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
