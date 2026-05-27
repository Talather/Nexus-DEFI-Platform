"use client";

import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";

extend({ Line_: THREE.Line });

function NetworkNode({ position, delay }: { position: [number, number, number]; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime + delay;
    meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.5;
    meshRef.current.rotation.x = time * 0.3;
    meshRef.current.rotation.z = time * 0.2;
    const s = 1 + Math.sin(time * 1.5) * 0.1;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial
        color="#00E676"
        emissive="#00E676"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function ConnectionLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const lineRef = useRef<THREE.Line>(null);

  const lineObj = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...start, ...end], 3));
    const mat = new THREE.LineBasicMaterial({ color: "#00BFA5", transparent: true, opacity: 0.3 });
    return new THREE.Line(g, mat);
  }, [start, end]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
  });

  return <primitive ref={lineRef} object={lineObj} />;
}

export function BlockchainNetwork() {
  const nodes: [number, number, number][] = useMemo(() => [
    [-8, 3, -5], [-4, -2, -8], [0, 4, -10], [5, -1, -7],
    [8, 3, -6], [-6, -4, -9], [3, 5, -8], [-2, -3, -6],
    [6, 0, -10], [-5, 2, -12], [4, -4, -11], [7, 2, -9],
  ], []);

  const connections = useMemo(() => {
    const conns: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i][0] - nodes[j][0], 2) +
          Math.pow(nodes[i][1] - nodes[j][1], 2) +
          Math.pow(nodes[i][2] - nodes[j][2], 2)
        );
        if (dist < 8) conns.push([i, j]);
      }
    }
    return conns;
  }, [nodes]);

  return (
    <group>
      {nodes.map((pos, i) => (
        <NetworkNode key={i} position={pos} delay={i * 0.5} />
      ))}
      {connections.map(([a, b], i) => (
        <ConnectionLine key={`line-${i}`} start={nodes[a]} end={nodes[b]} />
      ))}
    </group>
  );
}
