"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

interface CelebrityIntroSceneProps {
  videoUrl: string;
  onComplete: () => void;
  onSkip: () => void;
}

function VideoScreen({ videoUrl }: { videoUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    setTexture(videoTexture);

    return () => {
      video.pause();
      videoTexture.dispose();
    };
  }, [videoUrl]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function AnimatedCamera({ duration, onComplete }: { duration: number; onComplete: () => void }) {
  const { camera } = useThree();
  const startTime = useRef<number | null>(null);
  const completed = useRef(false);

  useFrame((state) => {
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;
    const t = Math.min(elapsed / duration, 1);

    const startZ = 14;
    const endZ = 8;
    camera.position.z = startZ + (endZ - startZ) * easeOutCubic(t);
    camera.position.y = Math.sin(t * Math.PI) * 0.5;
    camera.lookAt(0, 0, 0);

    if (t >= 1 && !completed.current) {
      completed.current = true;
      onComplete();
    }
  });

  return null;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CelebrityIntroScene({
  videoUrl,
  onComplete,
  onSkip,
}: CelebrityIntroSceneProps) {
  const INTRO_DURATION = 6;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0F10]">
      <Canvas camera={{ position: [0, 0, 14], fov: 50 }}>
        <color attach="background" args={["#0F0F10"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#d4af37" />
        <VideoScreen videoUrl={videoUrl} />
        <Sparkles count={80} scale={20} size={2} speed={0.3} color="#d4af37" />
        <AnimatedCamera duration={INTRO_DURATION} onComplete={onComplete} />
      </Canvas>
      <button
        onClick={onSkip}
        className="absolute bottom-10 right-10 z-10 rounded-full border border-border bg-card/80 px-8 py-3 text-sm tracking-wide text-foreground backdrop-blur-md transition-all duration-300 hover:border-accent hover:text-accent"
      >
        Skip
      </button>
    </div>
  );
}
