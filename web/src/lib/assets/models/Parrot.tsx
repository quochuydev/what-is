'use client';

import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Parrot: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/Parrot.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      firstAction.play();
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={0.03} />
    </group>
  );
};

Parrot.displayName = 'Parrot';
Parrot.description = 'Animated flying parrot';

export { Parrot };
