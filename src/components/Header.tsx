import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-30 p-6 sm:p-10 flex items-center justify-center pointer-events-none select-none">
      {/* Top Mid: Brand & Studio Meta */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-2.5 bg-black text-white px-4 py-2 rounded-xl border border-neutral-800 backdrop-blur-md shadow-xl">
          <h1
            className="font-archivo text-xs sm:text-sm font-black tracking-widest text-white uppercase"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            BETRYD STUDIO
          </h1>
        </div>
        <p className="font-mono text-[11px] text-neutral-600 font-semibold tracking-wider px-1 mt-2.5">
          • CREATIVE STUDIO — ESTABLISHED 2026
        </p>
      </div>
    </header>
  );
};
