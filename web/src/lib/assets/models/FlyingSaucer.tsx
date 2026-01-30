'use client';

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const FlyingSaucer: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('https://raw.githubusercontent.com/BabylonJS/MeshesLibrary/master/ufo.glb');

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />
    </group>
  );
};

FlyingSaucer.displayName = 'Flying Saucer';
FlyingSaucer.description = 'UFO that hovers above your head';

export { FlyingSaucer };
