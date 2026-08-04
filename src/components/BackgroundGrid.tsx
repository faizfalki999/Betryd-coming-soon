import React from 'react';

export const BackgroundGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
      {/* Studio Border Framing Line inspired by Image 2 */}
      <div className="absolute inset-4 sm:inset-8 border border-neutral-300/60 rounded-xl" />

      {/* Outer Technical Dashed Guideline Frame */}
      <div className="absolute inset-6 sm:inset-12 border border-dashed border-neutral-200/80 rounded-lg" />

      {/* Top Left Crosshair & Coordinate */}
      <div className="absolute top-10 left-10 flex items-center gap-2 text-[10px] font-mono text-neutral-300">
        <span className="w-3 h-3 border-l border-t border-neutral-400" />
        <span>SYS.GRID // 01.A</span>
      </div>

      {/* Top Right Crosshair & Coordinate */}
      <div className="absolute top-10 right-10 flex items-center gap-2 text-[10px] font-mono text-neutral-300">
        <span>SYS.TIMING // 2026</span>
        <span className="w-3 h-3 border-r border-t border-neutral-400" />
      </div>

      {/* Bottom Left Crosshair & Coordinate */}
      <div className="absolute bottom-10 left-10 flex items-center gap-2 text-[10px] font-mono text-neutral-300">
        <span className="w-3 h-3 border-l border-b border-neutral-400" />
        <span>SOCIAL.CHANNELS</span>
      </div>

      {/* Bottom Right Crosshair & Coordinate */}
      <div className="absolute bottom-10 right-10 flex items-center gap-2 text-[10px] font-mono text-neutral-300">
        <span>SUBSCRIBE.FORM</span>
        <span className="w-3 h-3 border-r border-b border-neutral-400" />
      </div>

      {/* Luxury Background Watermark Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none">
        <span className="font-serif text-[28vw] font-bold text-neutral-900 tracking-tighter uppercase whitespace-nowrap">
          BETRYD
        </span>
      </div>
    </div>
  );
};
