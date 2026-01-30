'use client';

import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Xbot: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/Xbot.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions['idle']) {
      actions['idle'].play();
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />
    </group>
  );
};

Xbot.displayName = 'Xbot';
Xbot.description = 'Humanoid robot character';

export { Xbot };
