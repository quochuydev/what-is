'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense, ReactNode } from 'react';

interface Canvas3DProps {
  children: ReactNode;
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

export function Canvas3D({ children }: Canvas3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: '#0a0a0a' }}
    >
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        <Environment preset="city" />
        {children}
      </Suspense>
    </Canvas>
  );
}
