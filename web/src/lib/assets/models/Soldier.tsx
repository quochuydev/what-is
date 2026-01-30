'use client';

import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Soldier: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/Soldier.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions['Walk']) {
      actions['Walk'].play();
    } else if (actions['Idle']) {
      actions['Idle'].play();
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />
    </group>
  );
};

Soldier.displayName = 'Soldier';
Soldier.description = 'Animated soldier with skeletal animation';

export { Soldier };
