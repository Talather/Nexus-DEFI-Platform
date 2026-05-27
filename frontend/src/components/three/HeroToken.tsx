"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Text } from "@react-three/drei";
import * as THREE from "three";
import { Suspense } from "react";

function TokenCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

    if (glowRef.current) {
      const s = 1.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#00E676" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          <torusGeometry args={[1.2, 0.35, 32, 64]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#C9A227"
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0.1}
          />
        </mesh>

        <Sphere args={[0.6, 64, 64]}>
          <MeshDistortMaterial
            color="#00E676"
            emissive="#00BFA5"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
            distort={0.3}
            speed={3}
          />
        </Sphere>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.02, 16, 64]} />
          <meshBasicMaterial color="#00E676" transparent opacity={0.5} />
        </mesh>

        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[1.8, 0.015, 16, 64]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
        </mesh>
      </Float>

      <pointLight position={[3, 3, 3]} color="#00E676" intensity={2} distance={10} />
      <pointLight position={[-3, -2, 2]} color="#FFD700" intensity={1.5} distance={10} />
      <ambientLight intensity={0.2} />
    </group>
  );
}

function OrbitalParticles() {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      angle: (i / 30) * Math.PI * 2,
      radius: 2 + Math.random() * 0.5,
      speed: 0.3 + Math.random() * 0.3,
      y: (Math.random() - 0.5) * 1,
      size: 0.03 + Math.random() * 0.03,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const angle = p.angle + time * p.speed;
      child.position.x = Math.cos(angle) * p.radius;
      child.position.z = Math.sin(angle) * p.radius;
      child.position.y = p.y + Math.sin(time * 2 + i) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#00E676" : "#FFD700"} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function HeroToken({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <TokenCore />
          <OrbitalParticles />
        </Suspense>
      </Canvas>
    </div>
  );
}
