'use client';

import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { AssetComponent } from '../types';

const Robot: AssetComponent = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions['Idle']) {
      actions['Idle'].play();
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={0.5} />
    </group>
  );
};

Robot.displayName = 'Robot';
Robot.description = 'Expressive robotic character';

export { Robot };
