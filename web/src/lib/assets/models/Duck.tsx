'use client';

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Duck: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF-Binary/Duck.glb');

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />
    </group>
  );
};

Duck.displayName = 'Duck';
Duck.description = 'Classic rubber duck';

export { Duck };
