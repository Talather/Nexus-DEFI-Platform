"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Suspense } from "react";

function ReactorCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      const s = 1 + Math.sin(t * 3) * 0.05;
      coreRef.current.scale.setScalar(s);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.8;
      ring1Ref.current.rotation.z = t * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.6;
      ring2Ref.current.rotation.x = t * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 1;
      ring3Ref.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.8, 4]} />
          <MeshDistortMaterial
            color="#00E676"
            emissive="#00BFA5"
            emissiveIntensity={1}
            metalness={0.7}
            roughness={0.1}
            distort={0.2}
            speed={4}
          />
        </mesh>
      </Float>

      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.5, 0.03, 16, 64]} />
        <meshStandardMaterial color="#00E676" emissive="#00E676" emissiveIntensity={0.8} metalness={1} roughness={0} />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[2, 0.02, 16, 64]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.6} metalness={1} roughness={0} />
      </mesh>

      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.5, 0.015, 16, 64]} />
        <meshStandardMaterial color="#00BFA5" emissive="#00BFA5" emissiveIntensity={0.4} metalness={1} roughness={0} />
      </mesh>

      <pointLight position={[0, 0, 0]} color="#00E676" intensity={3} distance={8} />
      <pointLight position={[3, 2, 2]} color="#FFD700" intensity={1} distance={10} />
      <ambientLight intensity={0.15} />
    </group>
  );
}

function EnergyStreams() {
  const groupRef = useRef<THREE.Group>(null);
  
  const streams = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      angle: (i / 40) * Math.PI * 2,
      speed: 0.5 + Math.random() * 1,
      radius: 1.2 + Math.random() * 1.5,
      size: 0.02 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
    })), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = streams[i];
      const angle = s.angle + t * s.speed;
      const r = s.radius + Math.sin(t * 2 + s.phase) * 0.3;
      child.position.x = Math.cos(angle) * r;
      child.position.y = Math.sin(t * s.speed + s.phase) * 0.8;
      child.position.z = Math.sin(angle) * r;
    });
  });

  return (
    <group ref={groupRef}>
      {streams.map((s, i) => (
        <mesh key={i}>
          <sphereGeometry args={[s.size, 6, 6]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#FFD700" : "#00E676"} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function StakingReactor({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-[300px] ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ReactorCore />
          <EnergyStreams />
        </Suspense>
      </Canvas>
    </div>
  );
}
