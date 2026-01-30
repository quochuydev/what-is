/**
 * Unified Assets Registry
 * GLB models only
 */

// Models
import { Xbot } from './models/Xbot';
import { Soldier } from './models/Soldier';
import { Robot } from './models/Robot';
import { FlyingSaucer } from './models/FlyingSaucer';
import { Parrot } from './models/Parrot';
import { Flamingo } from './models/Flamingo';
import { Stork } from './models/Stork';
import { Duck } from './models/Duck';
import { DamagedHelmet } from './models/DamagedHelmet';
import { Avocado } from './models/Avocado';

// Types
import { Asset, AssetComponent, ControlType } from './types';

export type { Asset, AssetComponent, ControlType };

/**
 * All available assets (GLB models)
 */
export const assets: Asset[] = [
  {
    id: 'xbot',
    name: 'Xbot',
    description: 'Humanoid robot character',
    component: Xbot,
    url: 'https://threejs.org/examples/models/gltf/Xbot.glb',
    scale: 1,
    animations: ['idle', 'walk', 'run'],
    defaultControlType: 'bothHands',
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description: 'Animated soldier with skeletal animation',
    component: Soldier,
    url: 'https://threejs.org/examples/models/gltf/Soldier.glb',
    scale: 1,
    animations: ['Idle', 'Walk', 'Run'],
    defaultControlType: 'rightHand',
  },
  {
    id: 'robot',
    name: 'Robot',
    description: 'Expressive robotic character',
    component: Robot,
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    scale: 0.5,
    animations: ['Idle', 'Walking', 'Running', 'Dance', 'Wave'],
    defaultControlType: 'leftHand',
  },
  {
    id: 'flying-saucer',
    name: 'Flying Saucer',
    description: 'UFO that hovers above your head',
    component: FlyingSaucer,
    url: 'https://raw.githubusercontent.com/BabylonJS/MeshesLibrary/master/ufo.glb',
    scale: 1,
    defaultControlType: 'topOfHead',
  },
  {
    id: 'parrot',
    name: 'Parrot',
    description: 'Animated flying parrot',
    component: Parrot,
    url: 'https://threejs.org/examples/models/gltf/Parrot.glb',
    scale: 0.03,
    animations: ['fly'],
    defaultControlType: 'rightHand',
  },
  {
    id: 'flamingo',
    name: 'Flamingo',
    description: 'Animated flying flamingo',
    component: Flamingo,
    url: 'https://threejs.org/examples/models/gltf/Flamingo.glb',
    scale: 0.03,
    animations: ['fly'],
    defaultControlType: 'leftHand',
  },
  {
    id: 'stork',
    name: 'Stork',
    description: 'Animated flying stork',
    component: Stork,
    url: 'https://threejs.org/examples/models/gltf/Stork.glb',
    scale: 0.03,
    animations: ['fly'],
    defaultControlType: 'topOfHead',
  },
  {
    id: 'duck',
    name: 'Duck',
    description: 'Classic rubber duck',
    component: Duck,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF-Binary/Duck.glb',
    scale: 1,
    defaultControlType: 'mouth',
  },
  {
    id: 'damaged-helmet',
    name: 'Damaged Helmet',
    description: 'Battle-worn sci-fi helmet',
    component: DamagedHelmet,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    scale: 1,
    defaultControlType: 'head',
  },
  {
    id: 'avocado',
    name: 'Avocado',
    description: 'Delicious avocado',
    component: Avocado,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Avocado/glTF-Binary/Avocado.glb',
    scale: 30,
    defaultControlType: 'mouth',
  },
];

/**
 * Get asset by ID
 */
export const getAssetById = (id: string): Asset | undefined => {
  return assets.find((a) => a.id === id);
};

/**
 * Get all assets
 */
export const getAllAssets = (): Asset[] => assets;
