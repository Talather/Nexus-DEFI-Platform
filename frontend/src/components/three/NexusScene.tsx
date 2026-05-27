"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Preload } from "@react-three/drei";
import { FloatingParticles } from "./FloatingParticles";
import { BlockchainNetwork } from "./BlockchainNetwork";
import { AmbientEnvironment } from "./AmbientEnvironment";

export function NexusScene({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <AmbientEnvironment />
          <FloatingParticles count={200} />
          <BlockchainNetwork />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
