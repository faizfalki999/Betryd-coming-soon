import React from 'react';
import { Mail, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FooterProps {
  onOpenModal: () => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ isAudioEnabled = true, onToggleAudio }) => {
  return (
    <footer className="absolute bottom-0 left-0 w-full z-30 p-4 pb-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-6 pointer-events-none select-none">
      {/* Bottom Left / Mobile Stack Top: Instagram Handle */}
      <div className="pointer-events-auto flex items-center justify-center w-full sm:w-auto">
        <a
          href="https://www.instagram.com/betryd.studio/"
          target="_blank"
          rel="noreferrer"
          className="group px-4 py-2 bg-white/95 hover:bg-neutral-950 hover:text-white border border-neutral-200 hover:border-neutral-900 rounded-xl text-neutral-900 text-[11px] sm:text-xs font-mono tracking-wider transition-all duration-300 backdrop-blur-md shadow-sm flex items-center justify-center gap-2 w-auto"
        >
          {/* Instagram SVG icon */}
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>INSTAGRAM @BETRYD.STUDIO</span>
          <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-white shrink-0" />
        </a>
      </div>

      {/* Bottom Right / Mobile Stack Bottom: Mail Support & Audio Toggle */}
      <div className="pointer-events-auto flex items-center justify-center gap-2 w-full sm:w-auto">
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=support@betryd.com"
          target="_blank"
          rel="noreferrer"
          onClick={() => sounds.playClickSound()}
          className="group px-4 py-2 bg-white/95 hover:bg-neutral-950 hover:text-white text-neutral-900 border border-neutral-200 hover:border-neutral-900 rounded-xl text-[11px] sm:text-xs font-mono tracking-widest uppercase transition-all duration-300 shadow-sm backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer w-auto"
        >
          <Mail className="w-3.5 h-3.5 text-neutral-500 group-hover:scale-110 transition-transform duration-300 shrink-0" />
          <span>SUPPORT@BETRYD.COM</span>
        </a>

        {/* Audio Toggle Button */}
        <button
          onClick={onToggleAudio}
          className="px-3 py-2 bg-white/95 hover:bg-neutral-950 hover:text-white text-neutral-900 border border-neutral-200 hover:border-neutral-900 rounded-xl text-[11px] sm:text-xs font-mono tracking-wider transition-all duration-300 backdrop-blur-md shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
          title={isAudioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {isAudioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-neutral-900 group-hover:text-white" />
              <span className="hidden sm:inline">SOUND ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
              <span className="hidden sm:inline">SOUND OFF</span>
            </>
          )}
        </button>
      </div>
    </footer>
  );
};
