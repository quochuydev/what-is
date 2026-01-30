'use client';

import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Flamingo: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/Flamingo.glb');
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

Flamingo.displayName = 'Flamingo';
Flamingo.description = 'Animated flying flamingo';

export { Flamingo };
