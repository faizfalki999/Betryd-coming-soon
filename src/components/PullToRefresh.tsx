import React, { useEffect, useState, useRef } from 'react';
import { sounds } from '../utils/audio';

export const PullToRefresh: React.FC = () => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);

  const PULL_THRESHOLD = 75; // Pull distance threshold in pixels

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Activate only on touch devices when scrolled to the top of the page
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop <= 5 && e.touches.length === 1) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || startYRef.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Track downward pull with native-style resistance
      if (deltaY > 0) {
        const distance = Math.min(deltaY * 0.45, 110);
        setPullDistance(distance);
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        sounds.playClickSound();

        // Keep spinner visible and spinning continuously while reloading
        setTimeout(() => {
          window.location.reload();
        }, 400);
      } else {
        // Released before threshold: animate back up and disappear without triggering refresh
        setPullDistance(0);
      }

      startYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  if (pullDistance <= 0 && !isRefreshing) return null;

  // Calculate subtle growth in size and opacity based on pull distance
  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1.0);
  const opacity = isRefreshing ? 1 : Math.max(progress, 0.15);
  const scale = isRefreshing ? 1 : 0.6 + progress * 0.4;
  const rotation = isRefreshing ? 0 : progress * 360;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200 ease-out"
      style={{
        transform: `translate(-50%, ${isRefreshing ? PULL_THRESHOLD : pullDistance}px) scale(${scale})`,
        opacity: opacity,
      }}
    >
      {/* Minimalist circular ring spinner (no text, no logos, matching site's monochrome theme) */}
      <div className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
        <div
          className={`w-5 h-5 border-2 border-neutral-200 border-t-black rounded-full ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={!isRefreshing ? { transform: `rotate(${rotation}deg)` } : undefined}
        />
      </div>
    </div>
  );
};
