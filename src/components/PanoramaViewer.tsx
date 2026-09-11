'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Pandal, Hotspot } from '../lib/types';
import { PANDALS_DATA } from '../lib/data/pandals';
import { audioEngine } from '../lib/audio';
import {
  X,
  Compass,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  HeartHandshake,
  Info,
  ChevronLeft,
  ChevronRight,
  Smartphone,
} from 'lucide-react';

interface PanoramaViewerProps {
  initialPandalId?: string;
  onClose: () => void;
  onOpenDonation: (pandal: Pandal) => void;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  initialPandalId = 'lalbaugcha-raja',
  onClose,
  onOpenDonation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPandal, setCurrentPandal] = useState<Pandal>(() => {
    return PANDALS_DATA.find(p => p.id === initialPandalId) || PANDALS_DATA[0];
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [offeringCount, setOfferingCount] = useState(0);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousTouchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lonRef = useRef(0);
  const latRef = useRef(0);

  // Setup Three.js WebGL 360 Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Sphere Geometry (Inverted scale for inside viewing)
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(currentPandal.panoramaImage);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphereMesh = new THREE.Mesh(geometry, material);
    sphereMeshRef.current = sphereMesh;
    scene.add(sphereMesh);

    // WebGL Renderer with powerPreference for mobile GPUs
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const domElement = renderer.domElement;

    // WebGL context hygiene listener to recover or clean up on low memory
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL Context Lost - low memory mobile browser fallback');
    };

    const handleContextRestored = () => {
      console.log('WebGL Context Restored');
    };

    domElement.addEventListener('webglcontextlost', handleContextLost, false);
    domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Clear existing canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(domElement);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!cameraRef.current || !rendererRef.current) return;

      // Restrict vertical latitude angle (-85 to 85)
      latRef.current = Math.max(-85, Math.min(85, latRef.current));

      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      cameraTargetRef.current.x = 500 * Math.sin(phi) * Math.cos(theta);
      cameraTargetRef.current.y = 500 * Math.cos(phi);
      cameraTargetRef.current.z = 500 * Math.sin(phi) * Math.sin(theta);

      cameraRef.current.lookAt(cameraTargetRef.current);
      rendererRef.current.render(scene, cameraRef.current);
    };

    animate();

    // Resize Listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('webglcontextlost', handleContextLost);
      domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      // Clean WebGL memory context
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [currentPandal]);

  // Handle Drag Panning (Mouse & Touch)
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    previousTouchRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;

    const deltaX = clientX - previousTouchRef.current.x;
    const deltaY = clientY - previousTouchRef.current.y;

    lonRef.current -= deltaX * 0.25;
    latRef.current += deltaY * 0.25;

    previousTouchRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Gyroscope Control Handler
  const toggleGyroscope = async () => {
    if (typeof window === 'undefined') return;

    if (!gyroEnabled) {
      // Request DeviceOrientation permission if iOS
      const deviceOrientationEvent = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof deviceOrientationEvent.requestPermission === 'function') {
        try {
          const response = await deviceOrientationEvent.requestPermission();
          if (response === 'granted') {
            setGyroEnabled(true);
            window.addEventListener('deviceorientation', handleGyroMotion);
          }
        } catch (err) {
          console.warn('Gyro permission error', err);
        }
      } else {
        setGyroEnabled(true);
        window.addEventListener('deviceorientation', handleGyroMotion);
      }
    } else {
      setGyroEnabled(false);
      window.removeEventListener('deviceorientation', handleGyroMotion);
    }
  };

  const handleGyroMotion = (event: DeviceOrientationEvent) => {
    if (event.gamma !== null && event.beta !== null) {
      lonRef.current = event.gamma * 2;
      latRef.current = (event.beta - 45) * 1.5;
    }
  };

  // Flower & Modak Shower Offering Animation
  const handleOfferFlowers = () => {
    audioEngine.playTempleBell();
    setOfferingCount(prev => prev + 1);

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFB800', '#FF5500', '#E53935', '#FFF'],
      scalar: 1.2,
    });
  };

  // Toggle Audio Aarti sound
  const handleToggleAarti = () => {
    if (!isAudioPlaying) {
      audioEngine.playTempleBell();
      setIsAudioPlaying(true);
    } else {
      setIsAudioPlaying(false);
    }
  };

  // Pandal Switcher Carousel
  const handleSelectNextPandal = (direction: 'next' | 'prev') => {
    const currentIndex = PANDALS_DATA.findIndex(p => p.id === currentPandal.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= PANDALS_DATA.length) newIndex = 0;
    if (newIndex < 0) newIndex = PANDALS_DATA.length - 1;

    setCurrentPandal(PANDALS_DATA[newIndex]);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none animate-fadeIn">
      {/* Top Floating Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 hover:bg-ganesha-saffron transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ganesha-gold">
              360° Virtual Darshan
            </span>
            <h2 className="text-sm font-extrabold text-white leading-tight flex items-center space-x-1">
              <span>{currentPandal.name}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Gyroscope Motion Toggle */}
          <button
            onClick={toggleGyroscope}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
              gyroEnabled
                ? 'bg-ganesha-gold text-slate-950 border-ganesha-gold'
                : 'bg-slate-900/80 text-gray-300 border-white/20 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{gyroEnabled ? 'Gyro On' : 'Gyro Mode'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-white border border-white/20 hover:border-ganesha-gold"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main WebGL 360 Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={e => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={e => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onTouchStart={e => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={e => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handlePointerUp}
      />

      {/* Pandal Switcher Navigation Arrows */}
      <button
        onClick={() => handleSelectNextPandal('prev')}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/70 backdrop-blur-md text-white border border-white/20 hover:bg-ganesha-gold hover:text-slate-950 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => handleSelectNextPandal('next')}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/70 backdrop-blur-md text-white border border-white/20 hover:bg-ganesha-gold hover:text-slate-950 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Floating Interactive Action Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="glass-panel-gold p-3 rounded-2xl flex items-center justify-around space-x-2 shadow-2xl">
          {/* Flower & Modak Shower Offering */}
          <button
            onClick={handleOfferFlowers}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-gradient-to-r from-ganesha-saffron/30 to-ganesha-gold/30 border border-ganesha-gold/50 text-white font-bold hover:scale-105 active:scale-95 transition-all"
          >
            <div className="flex items-center space-x-1 text-ganesha-gold text-xs">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Offer Flowers</span>
            </div>
            <span className="text-[10px] text-gray-300 font-normal">
              {offeringCount > 0 ? `${offeringCount} Offered` : 'Tap to Offer'}
            </span>
          </button>

          {/* Audio Aarti Toggle */}
          <button
            onClick={handleToggleAarti}
            className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
              isAudioPlaying
                ? 'bg-ganesha-gold text-slate-950 border-ganesha-gold font-bold scale-105'
                : 'bg-slate-900/80 text-gray-300 border-white/20 hover:text-white'
            }`}
            title="Toggle Aarti Audio Chants"
          >
            {isAudioPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>

          {/* Direct Donation Trigger */}
          <button
            onClick={() => onOpenDonation(currentPandal)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-gradient-to-r from-ganesha-saffron to-ganesha-gold text-slate-950 font-extrabold shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <div className="flex items-center space-x-1 text-xs">
              <HeartHandshake className="w-4 h-4 text-slate-950" />
              <span>Donate 0% Fee</span>
            </div>
            <span className="text-[10px] text-slate-900 font-bold opacity-80">
              Direct UPI
            </span>
          </button>
        </div>
      </div>

      {/* Hotspot Info Modal Overlay */}
      {activeHotspot && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel p-5 rounded-2xl max-w-sm w-full border border-ganesha-gold/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-ganesha-gold/20 text-ganesha-gold flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{activeHotspot.title}</h3>
            <p className="text-xs text-gray-300">{activeHotspot.description}</p>
            <button
              onClick={() => setActiveHotspot(null)}
              className="w-full bg-ganesha-gold text-slate-950 font-bold py-2 rounded-xl text-xs hover:brightness-110"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
