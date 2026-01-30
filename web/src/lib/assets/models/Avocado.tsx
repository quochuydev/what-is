'use client';

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Avocado: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Avocado/glTF-Binary/Avocado.glb');

  return (
    <group ref={group}>
      <primitive object={scene} scale={30} />
    </group>
  );
};

Avocado.displayName = 'Avocado';
Avocado.description = 'Delicious avocado';

export { Avocado };
