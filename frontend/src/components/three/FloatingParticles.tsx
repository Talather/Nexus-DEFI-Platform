"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function FloatingParticles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
        ],
        speed: Math.random() * 0.5 + 0.1,
        offset: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.08 + 0.02,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      const { position, speed, offset, scale } = particle;
      dummy.position.set(
        position[0] + Math.sin(time * speed + offset) * 2,
        position[1] + Math.cos(time * speed * 0.8 + offset) * 2,
        position[2] + Math.sin(time * speed * 0.5 + offset) * 1.5
      );
      dummy.scale.setScalar(scale * (1 + Math.sin(time * 2 + offset) * 0.3));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#00E676" transparent opacity={0.6} />
    </instancedMesh>
  );
}
