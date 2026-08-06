'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ecus, networks } from '@/lib/data';
import { cn } from '@/lib/utils';

export function Topology3DView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: -15, y: 25 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedEcu, setSelectedEcu] = useState<string | null>(null);

  const featuredEcus = ecus.slice(0, 12);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation((r) => ({ x: r.x + dy * 0.3, y: r.y + dx * 0.3 }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full engineering-bg overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <div className="absolute top-3 left-3 text-[10px] text-slate-500">
        Drag to rotate • Click ECU to select
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: '1000px',
        }}
      >
        <div
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
          className="relative"
        >
          {featuredEcus.map((ecu, i) => {
            const angle = (i / featuredEcus.length) * Math.PI * 2;
            const radius = 200;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (i % 3) * 40 - 40;

            return (
              <motion.div
                key={ecu.id}
                className={cn(
                  'absolute w-24 rounded-lg border backdrop-blur-sm bg-slate-900/90 p-2 cursor-pointer transition-all',
                  selectedEcu === ecu.id
                    ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                    : 'border-slate-700/50 hover:border-cyan-500/30'
                )}
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => setSelectedEcu(ecu.id)}
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-[10px] font-bold text-slate-200">{ecu.shortName}</span>
                <span className="text-[8px] text-slate-500 block">{ecu.domain}</span>
              </motion.div>
            );
          })}

          {/* Center gateway */}
          <div
            className="absolute w-16 h-16 rounded-full border-2 border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center"
            style={{ transform: 'translate3d(-32px, -32px, 0px)' }}
          >
            <span className="text-[9px] text-cyan-400 font-bold">GW</span>
          </div>

          {/* Glowing connection lines */}
          {featuredEcus.map((ecu, i) => {
            const angle = (i / featuredEcus.length) * Math.PI * 2;
            return (
              <motion.div
                key={`line-${ecu.id}`}
                className="absolute h-px bg-gradient-to-r from-cyan-500/40 to-transparent origin-left"
                style={{
                  width: 200,
                  left: 0,
                  top: 0,
                  transform: `rotateY(${-(i / featuredEcus.length) * 360}deg) translateZ(0px)`,
                  transformStyle: 'preserve-3d',
                }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            );
          })}
        </div>
      </div>

      {/* Animated packets traveling */}
      {networks.slice(0, 3).map((net, i) => (
        <motion.div
          key={net.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: net.color, boxShadow: `0 0 8px ${net.color}` }}
          animate={{
            x: ['10%', '90%', '10%'],
            y: [`${20 + i * 25}%`, `${30 + i * 25}%`, `${20 + i * 25}%`],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {selectedEcu && (
        <div className="absolute bottom-4 left-4 glass-panel rounded-lg p-3 max-w-xs">
          <p className="text-xs font-semibold text-slate-200">
            {ecus.find((e) => e.id === selectedEcu)?.name}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {ecus.find((e) => e.id === selectedEcu)?.description.slice(0, 100)}...
          </p>
        </div>
      )}
    </div>
  );
}
