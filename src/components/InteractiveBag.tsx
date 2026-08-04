import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type PanInfo } from 'framer-motion';
import { Hand, Sparkles, Eye, Move, Box } from 'lucide-react';

import { sounds } from '../utils/audio';
import { ThreeBagCanvas } from './ThreeBagCanvas';

interface InteractiveBagProps {
  onBagClick: () => void;
  isModalOpen: boolean;
  activeVariant: 'obsidian' | 'champagne';
}

// Distance threshold in pixels to differentiate between a click vs a drag gesture
const DRAG_THRESHOLD_PX = 6;

export const InteractiveBag: React.FC<InteractiveBagProps> = ({
  onBagClick,
  isModalOpen,
  activeVariant,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [dragVelocity, setDragVelocity] = useState({ x: 0, y: 0 });

  // Track initial pointer down coordinates for accurate click vs drag measurement
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // Motion values for smooth 3D tilt momentum and dynamic shadow response
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring dynamics for fluid physics tilt based on movement speed
  const rotateZ = useSpring(0, { stiffness: 300, damping: 25 });
  const rotateX = useSpring(0, { stiffness: 300, damping: 25 });
  const scale = useSpring(1, { stiffness: 400, damping: 25 });

  // Dynamic shadow properties based on vertical offset
  const shadowScale = useTransform(y, [-200, 0, 200], [0.65, 1, 0.75]);
  const shadowOpacity = useTransform(y, [-200, 0, 200], [0.25, 0.6, 0.3]);

  // Image source based on active variant
  const bagImagePath = activeVariant === 'obsidian' ? '/assets/bag_obsidian1.png' : '/assets/bag_champagne.png';

  // Handle Pointer Down to log start coordinates
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    sounds.playGrabSound();
  };

  // Handle Pointer Up to test if movement was within click threshold
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerDownPos.current) return;

    const deltaX = e.clientX - pointerDownPos.current.x;
    const deltaY = e.clientY - pointerDownPos.current.y;
    const distanceMoved = Math.hypot(deltaX, deltaY);

    // Reset tilt spring physics on release
    rotateZ.set(0);
    rotateX.set(0);
    scale.set(1);
    setDragVelocity({ x: 0, y: 0 });

    // If movement was less than threshold and modal is closed, trigger unpack action
    if (distanceMoved < DRAG_THRESHOLD_PX && !isModalOpen) {
      sounds.playModalOpenSound();
      onBagClick();
    } else {
      sounds.playReleaseSound();
    }

    pointerDownPos.current = null;
  };

  // Dynamic tilt response during active drag
  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Heavy weight tilt physics simulation (leans into direction of velocity)
    const tiltZ = Math.min(Math.max(info.velocity.x * 0.04, -18), 18);
    const tiltX = Math.min(Math.max(-info.velocity.y * 0.03, -15), 15);
    rotateZ.set(tiltZ);
    rotateX.set(tiltX);
    setDragVelocity({ x: info.velocity.x, y: info.velocity.y });
  };

  const handleDragStart = () => {
    setIsDraggingState(true);
    scale.set(1.06);
  };

  const handleDragEnd = () => {
    setIsDraggingState(false);
    rotateZ.set(0);
    rotateX.set(0);
    scale.set(1);
    setDragVelocity({ x: 0, y: 0 });
  };

  // Calculate viewport boundaries for elastic constraint
  const [constraints, setConstraints] = useState({ left: -300, right: 300, top: -200, bottom: 200 });

  useEffect(() => {
    const updateConstraints = () => {
      const padding = 160;
      const w = window.innerWidth / 2 - padding;
      const h = window.innerHeight / 2 - padding;
      setConstraints({ left: -w, right: w, top: -h, bottom: h });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none touch-none">
      {/* Dynamic Ambient Ground Spotlight & Physics Shadow */}
      <motion.div
        style={{ scaleX: shadowScale, opacity: shadowOpacity }}
        className="absolute -bottom-16 w-80 h-16 bg-gradient-to-t from-amber-500/20 via-black/80 to-transparent rounded-full blur-2xl pointer-events-none transition-all duration-300"
      />

      {/* Interactive Floating / Drag Bag Container */}
      <motion.div
        style={{ x, y, rotateZ, rotateX, scale }}
        drag={!isModalOpen}
        dragConstraints={constraints}
        dragElastic={0.12}
        dragTransition={{
          power: 0.25,
          timeConstant: 220,
          bounceStiffness: 500,
          bounceDamping: 32,
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          scale: isModalOpen ? 0.72 : isHovered ? 1.05 : 1,
          y: isModalOpen ? -140 : [0, -10, 0],
          opacity: isModalOpen ? 0.45 : 1,
          filter: isModalOpen ? 'blur(4px) brightness(0.6)' : 'blur(0px) brightness(1)',
        }}
        transition={{
          y: isModalOpen ? { duration: 0.5 } : { repeat: Infinity, duration: 4, ease: 'easeInOut' },
          scale: { type: 'spring', stiffness: 350, damping: 25 },
        }}
        className={`relative z-20 cursor-grab-custom active:cursor-grabbing group ${
          isModalOpen ? 'pointer-events-none' : ''
        }`}
      >
        {/* Glowing Halo Aura behind Bag */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-purple-600/20 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none ${
            isHovered || isDraggingState ? 'opacity-80 scale-125' : 'opacity-30'
          }`}
        />

        {/* Real-Time Three.js 3D WebGL Canvas Container */}
        <div className="relative w-80 h-80 sm:w-[420px] sm:h-[420px] flex items-center justify-center p-2">
          <ThreeBagCanvas
            bagImagePath={bagImagePath}
            isHovered={isHovered}
            isDragging={isDraggingState}
            dragVelocity={dragVelocity}
          />

          {/* Interactive Badges on Bag Hover */}
          {!isModalOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered || isDraggingState ? 1 : 0, y: isHovered ? 0 : 10 }}
              className="absolute -top-4 sm:top-2 left-1/2 -translate-x-1/2 glass-pill px-4 py-1.5 rounded-full flex items-center gap-2 border border-amber-500/40 text-amber-200 text-xs tracking-wider uppercase shadow-xl backdrop-blur-md pointer-events-none"
            >
              <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isDraggingState ? 'Dragging 3D Physics Bag' : '3D WebGL Active • Click to Unpack'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </motion.div>
          )}

          {/* 3D WebGL Indicator Badge */}
          <div className="absolute bottom-6 right-6 glass-pill px-3 py-1 rounded-md text-[10px] font-mono-tech text-amber-300 border border-amber-500/30 flex items-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity">
            <Box className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>THREE.JS 3D MESH</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Click Call-To-Action Pill below Bag */}
      {!isModalOpen && (
        <motion.button
          onClick={() => {
            sounds.playModalOpenSound();
            onBagClick();
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 z-30 glass-pill px-6 py-2.5 rounded-full border border-amber-500/30 text-amber-100 hover:text-white flex items-center gap-2.5 text-xs tracking-widest uppercase transition-all duration-300 shadow-2xl hover:border-amber-400/70 group"
        >
          <Eye className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>Unpack Bespoke Collection</span>
          <Hand className="w-3.5 h-3.5 text-amber-400/80 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      )}
    </div>
  );
};
