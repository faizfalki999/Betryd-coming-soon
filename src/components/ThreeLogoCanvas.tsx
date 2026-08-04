import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { sounds } from '../utils/audio';

interface ThreeLogoCanvasProps {
  onLogoClick: () => void;
  isModalOpen: boolean;
}

export const ThreeLogoCanvas: React.FC<ThreeLogoCanvasProps> = ({
  onLogoClick,
  isModalOpen,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interaction refs
  const isPointerDownRef = useRef(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previousPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const angularVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0.008 });
  const logoGroupRef = useRef<THREE.Group | null>(null);

  // Rotation & spin tracking refs
  const accumulatedRotationRef = useRef(0);
  const lastRotationYRef = useRef(0);
  const lastRotationXRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  const isModalOpenRef = useRef(isModalOpen);
  const onLogoClickRef = useRef(onLogoClick);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
    onLogoClickRef.current = onLogoClick;

    if (!isModalOpen) {
      accumulatedRotationRef.current = 0;
      hasTriggeredRef.current = false;
    }
  }, [isModalOpen, onLogoClick]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff');

    // Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    // Renderer setup (Shadows completely disabled)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear element
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    // Create 3D Logo Group
    const logoGroup = new THREE.Group();
    logoGroupRef.current = logoGroup;
    scene.add(logoGroup);

    // Load exact betryd.png image & convert to pure 100% jet black logo cutout
    const img = new Image();
    img.src = '/assets/betryd.png';
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        // Process pixels: make background transparent, and make logo stroke 100% pure pitch black (#000000)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Near-white background -> transparent
          if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0;
          } else {
            // Logo stroke -> 100% full rich pitch black
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            if (data[i + 3] > 20) {
              data[i + 3] = 255;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        const logoTexture = new THREE.CanvasTexture(canvas);
        logoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        logoTexture.needsUpdate = true;

        const aspectRatio = img.width / img.height;
        const logoHeight = 3.6;
        const logoWidth = logoHeight * aspectRatio;
        const logoGeometry = new THREE.PlaneGeometry(logoWidth, logoHeight);

        // Pure pitch black material
        const logoMaterial = new THREE.MeshBasicMaterial({
          map: logoTexture,
          transparent: true,
          alphaTest: 0.05,
          side: THREE.DoubleSide,
          color: 0x000000,
        });

        // Stack layers for tactile 3D volume
        const layers = 6;
        const depth = 0.08;
        for (let i = 0; i < layers; i++) {
          const zOffset = (i / (layers - 1) - 0.5) * depth;
          const meshLayer = new THREE.Mesh(logoGeometry, logoMaterial);
          meshLayer.position.z = zOffset;
          logoGroup.add(meshLayer);
        }
      }
    };

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (logoGroupRef.current) {
        const currentY = logoGroupRef.current.rotation.y;
        const currentX = logoGroupRef.current.rotation.x;

        const deltaY = Math.abs(currentY - lastRotationYRef.current);
        const deltaX = Math.abs(currentX - lastRotationXRef.current);

        lastRotationYRef.current = currentY;
        lastRotationXRef.current = currentX;

        // Apply rotation from velocity if not actively dragging
        if (!isPointerDownRef.current) {
          logoGroupRef.current.rotation.y += angularVelocityRef.current.y;
          logoGroupRef.current.rotation.x += angularVelocityRef.current.x;

          // Gentle floating motion
          logoGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

          // Inertia damping back to steady auto-rotation
          angularVelocityRef.current.y = THREE.MathUtils.lerp(angularVelocityRef.current.y, 0.007, 0.03);
          angularVelocityRef.current.x = THREE.MathUtils.lerp(angularVelocityRef.current.x, 0, 0.03);
        }

        // Track user-driven rotation (active dragging OR fast user swipe/flick momentum)
        const isUserSpinning =
          isPointerDownRef.current ||
          Math.abs(angularVelocityRef.current.y) > 0.015 ||
          Math.abs(angularVelocityRef.current.x) > 0.015;

        if (!isModalOpenRef.current && !hasTriggeredRef.current && isUserSpinning) {
          // Filter out initial frame setup jump
          if (deltaY < 1.0 && deltaX < 1.0) {
            accumulatedRotationRef.current += deltaY + deltaX;
          }

          const REQUIRED_RADIANS = Math.PI * 8; // 4 full 360° revolutions (4th spin)
          if (accumulatedRotationRef.current >= REQUIRED_RADIANS) {
            hasTriggeredRef.current = true;
            sounds.playModalOpenSound();
            onLogoClickRef.current();
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  // Pointer Event Handlers for 3D Trackball Rotation & Click Detection
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isModalOpen) return;
    isPointerDownRef.current = true;
    sounds.playGrabSound();

    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !logoGroupRef.current || isModalOpen) return;

    const deltaX = e.clientX - previousPointerPosRef.current.x;
    const deltaY = e.clientY - previousPointerPosRef.current.y;

    const rotationSpeed = 0.008;
    logoGroupRef.current.rotation.y += deltaX * rotationSpeed;
    logoGroupRef.current.rotation.x += deltaY * rotationSpeed;

    // Track velocity for inertia
    angularVelocityRef.current = {
      x: deltaY * rotationSpeed * 0.5,
      y: deltaX * rotationSpeed * 0.5,
    };

    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    sounds.playReleaseSound();

    // Distance calculation to differentiate click vs drag
    const dx = Math.abs(e.clientX - pointerStartPosRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartPosRef.current.y);

    if (dx < 6 && dy < 6) {
      // User tapped/clicked the logo!
      sounds.playModalOpenSound();
      onLogoClick();
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        isPointerDownRef.current = false;
      }}
    >
      {/* ThreeJS WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
};

