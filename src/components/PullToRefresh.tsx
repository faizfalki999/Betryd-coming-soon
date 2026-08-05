import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { sounds } from '../utils/audio';

export const PullToRefresh: React.FC = () => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);

  const PULL_THRESHOLD = 90; // Pixels needed to trigger refresh

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only initiate pull-to-refresh if near the top of page
      if (window.scrollY <= 10 && e.touches.length === 1) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || startYRef.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Only care about pulling downward
      if (deltaY > 0) {
        // Resistance curve calculation
        const distance = Math.min(deltaY * 0.5, 140);
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
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
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

  const isReadyToRelease = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-transform duration-200 ease-out"
      style={{
        transform: `translate(-50%, ${Math.min(pullDistance, 100)}px)`,
      }}
    >
      <div className="flex items-center gap-2 bg-black/90 text-white px-4 py-2 rounded-full shadow-2xl border border-neutral-700 backdrop-blur-md text-xs font-mono tracking-wider">
        {isRefreshing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
            <span>REFRESHING...</span>
          </>
        ) : isReadyToRelease ? (
          <>
            <RefreshCw className="w-4 h-4 text-emerald-400 rotate-180 transition-transform duration-300" />
            <span className="text-emerald-400 font-bold">RELEASE TO REFRESH</span>
          </>
        ) : (
          <>
            <ArrowDown
              className="w-4 h-4 text-neutral-400 transition-transform duration-200"
              style={{ transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` }}
            />
            <span className="text-neutral-300">PULL DOWN TO REFRESH</span>
          </>
        )}
      </div>
    </div>
  );
};
