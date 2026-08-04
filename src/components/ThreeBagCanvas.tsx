import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBagCanvasProps {
  bagImagePath: string;
  isHovered: boolean;
  isDragging: boolean;
  dragVelocity: { x: number; y: number };
}

export const ThreeBagCanvas: React.FC<ThreeBagCanvasProps> = ({
  bagImagePath,
  isHovered,
  isDragging,
  dragVelocity,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader>(new THREE.TextureLoader());

  // Mouse tracking for interactive 3D spotlight
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 384;
    const height = container.clientHeight || 384;

    // 1. Initialize 3D Scene, Camera, and WebGL Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Dynamic Key Light (Tracks cursor for metallic reflections)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.0);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);
    lightRef.current = keyLight;

    // Subtle Cool Blue Rim Light for luxury contour definition
    const rimLight = new THREE.DirectionalLight(0x80bfff, 2.0);
    rimLight.position.set(-3, -2, 2);
    scene.add(rimLight);

    // Warm Gold Accent Point Light
    const goldLight = new THREE.PointLight(0xd4af37, 2.5, 10);
    goldLight.position.set(0, 0, 3);
    scene.add(goldLight);

    // 3. Create 3D Curved Plane Geometry with Depth Displacement
    const geometry = new THREE.PlaneGeometry(3.2, 3.2, 48, 48);
    const pos = geometry.attributes.position;

    // Deform vertices to create realistic 3D leather volume bulge
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const distFromCenter = Math.sqrt(u * u + v * v);
      // Soft 3D convex depth curve
      const zOffset = Math.max(0, 0.35 * Math.cos((distFromCenter / 2.2) * (Math.PI / 2)));
      pos.setZ(i, zOffset);
    }
    geometry.computeVertexNormals();

    // 4. Load Texture and Create Standard PBR Material
    const texture = textureLoaderRef.current.load(bagImagePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.28, // High-end leather sheen
      metalness: 0.4,  // Metallic clasp reflections
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Track pointer movement over window for light tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = -((e.clientY - rect.top) / height) * 2 + 1;
      mousePos.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Render Loop with Smooth Inertial 3D Physics
    let animationFrameId: number;
    let targetRotX = 0;
    let targetRotY = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (meshRef.current) {
        // Continuous soft idle 3D floating rotation
        const time = Date.now() * 0.0012;
        const idleX = Math.sin(time * 0.8) * 0.06;
        const idleY = Math.cos(time * 0.6) * 0.08;

        // Mouse pointer sway
        const mouseX = mousePos.current.x * 0.35;
        const mouseY = mousePos.current.y * 0.25;

        // Velocity inertia sway during drag
        const velX = (dragVelocity.x || 0) * 0.0003;
        const velY = (dragVelocity.y || 0) * 0.0003;

        targetRotX = idleX + mouseY + velY;
        targetRotY = idleY + mouseX + velX;

        // Smooth slerp rotation interpolation
        meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.08;
        meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.08;
        meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;

        // Hover scale up in 3D space
        const targetScale = isHovered || isDragging ? 1.08 : 1.0;
        meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.1;
        meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.1;
        meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.1;
      }

      // Move key directional light dynamically to create moving 3D specular shine across leather
      if (lightRef.current) {
        lightRef.current.position.x = mousePos.current.x * 3 + 2;
        lightRef.current.position.y = mousePos.current.y * 3 + 3;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update texture when variant changes
  useEffect(() => {
    if (materialRef.current) {
      const newTexture = textureLoaderRef.current.load(bagImagePath);
      newTexture.colorSpace = THREE.SRGBColorSpace;
      materialRef.current.map = newTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [bagImagePath]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
    />
  );
};
