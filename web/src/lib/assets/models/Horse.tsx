'use client';

import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Horse: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/Horse.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      firstAction.play();
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={0.01} />
    </group>
  );
};

Horse.displayName = 'Horse';
Horse.description = 'Animated galloping horse';

export { Horse };
