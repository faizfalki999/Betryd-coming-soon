import React, { useEffect, useState, useRef } from 'react';
import { sounds } from '../utils/audio';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  const PULL_THRESHOLD = 75; // Pull distance threshold in pixels

  // Update refs to avoid re-binding event listeners
  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Treat any scrollTop <= 0 as at the top of the page (iOS elastic scroll guard)
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop <= 0 && e.touches.length === 1 && !isRefreshingRef.current) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
        pullDistanceRef.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || startYRef.current === null || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Track downward pull with resistance
      if (deltaY > 0) {
        // Prevent browser native pull-to-refresh/rubber-band scrolling
        if (e.cancelable) {
          e.preventDefault();
        }
        const distance = Math.min(deltaY * 0.45, 110);
        pullDistanceRef.current = distance;
        setPullDistance(distance);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      const finalDistance = pullDistanceRef.current;

      if (finalDistance >= PULL_THRESHOLD && !isRefreshingRef.current) {
        setIsRefreshing(true);
        sounds.playClickSound();

        try {
          if (onRefreshRef.current) {
            await onRefreshRef.current();
          } else {
            // Simulated delay if no callback is supplied
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        } catch (err) {
          console.error('Refresh failed:', err);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }

      startYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  if (pullDistance <= 0 && !isRefreshing) return null;

  // Calculate subtle growth in size and opacity based on pull distance
  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1.0);
  const opacity = isRefreshing ? 1 : Math.max(progress, 0.15);
  const scale = isRefreshing ? 1 : 0.6 + progress * 0.4;
  const rotation = isRefreshing ? 0 : progress * 360;

  return (
    <div
      className="fixed top-4 left-0 w-full z-50 pointer-events-none flex justify-center transition-all duration-200 ease-out"
      style={{
        transform: `translateY(${isRefreshing ? PULL_THRESHOLD : pullDistance}px) scale(${scale})`,
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
