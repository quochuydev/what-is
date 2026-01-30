'use client';

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const DamagedHelmet: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb');

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />
    </group>
  );
};

DamagedHelmet.displayName = 'DamagedHelmet';
DamagedHelmet.description = 'Battle-worn sci-fi helmet';

export { DamagedHelmet };
