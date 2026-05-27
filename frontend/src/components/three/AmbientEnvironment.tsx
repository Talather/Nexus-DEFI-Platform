"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GlowRing({ radius, color, speed }: { radius: number; color: string; speed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = state.clock.elapsedTime * speed * 0.1;
    ringRef.current.rotation.z = state.clock.elapsedTime * speed * 0.15;
  });

  return (
    <mesh ref={ringRef} position={[0, 0, -15]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}

export function AmbientEnvironment() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} color="#00E676" intensity={0.5} distance={50} />
      <pointLight position={[-10, -10, 5]} color="#FFD700" intensity={0.3} distance={40} />
      <pointLight position={[0, 0, -10]} color="#00BFA5" intensity={0.4} distance={30} />

      <GlowRing radius={8} color="#00E676" speed={1} />
      <GlowRing radius={10} color="#00BFA5" speed={-0.7} />
      <GlowRing radius={12} color="#FFD700" speed={0.5} />
    </group>
  );
}
