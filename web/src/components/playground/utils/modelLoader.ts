import { Asset, getAssetById } from "@/lib/assets";
import { ControlType } from "../settings/types";

declare global {
  interface Window {
    THREE: any;
    GLTFLoader: any;
  }
}

export interface LoadedModel {
  id: string;
  model: any; // THREE.Group
  mixer: any; // THREE.AnimationMixer
  animations: any[]; // THREE.AnimationClip[]
  currentAction: any; // THREE.AnimationAction
  controlType: ControlType;
  config: Asset;
}

// Wait for GLTFLoader to be available
async function waitForGLTFLoader(timeout = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    // Check both window.GLTFLoader (explicitly set) and THREE.GLTFLoader (legacy script)
    if (window.THREE && (window.GLTFLoader || window.THREE.GLTFLoader)) {
      // Ensure GLTFLoader is available on window for consistency
      if (!window.GLTFLoader && window.THREE.GLTFLoader) {
        window.GLTFLoader = window.THREE.GLTFLoader;
      }
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

export async function loadModel(
  modelId: string,
  controlType: ControlType,
  scene: any,
  scale?: number
): Promise<LoadedModel | null> {
  const config = getAssetById(modelId);
  if (!config || !config.url) return null;

  // Wait for GLTFLoader to be available
  const loaderReady = await waitForGLTFLoader();
  if (!loaderReady) {
    console.error("GLTFLoader not available after timeout");
    return null;
  }

  const THREE = window.THREE;
  const GLTFLoader = window.GLTFLoader;

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      config.url,
      (gltf: any) => {
        const model = gltf.scene;
        model.scale.setScalar(scale ?? config.scale ?? 1);
        model.position.set(0, -2, 0);

        // Enable shadow casting
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // Setup animation mixer
        const mixer = new THREE.AnimationMixer(model);
        const animations = gltf.animations;
        let currentAction = null;

        // Play default animation (Idle or first available)
        if (animations.length > 0) {
          const idleClip = animations.find(
            (a: any) => a.name === "Idle" || a.name === "idle"
          );
          const clip = idleClip || animations[0];
          currentAction = mixer.clipAction(clip);
          currentAction.play();
        }

        resolve({
          id: modelId,
          model,
          mixer,
          animations,
          currentAction,
          controlType,
          config,
        });
      },
      undefined,
      (error: any) => {
        console.error(`Failed to load model ${modelId}:`, error);
        reject(error);
      }
    );
  });
}

export function updateModelPosition(
  loadedModel: LoadedModel,
  position: { x: number; y: number },
  handLandmarks?: any[]
) {
  if (!loadedModel.model) return;

  // Smooth position update
  const targetX = position.x;
  const targetY = position.y - 1; // Offset down slightly

  loadedModel.model.position.x +=
    (targetX - loadedModel.model.position.x) * 0.15;
  loadedModel.model.position.y +=
    (targetY - loadedModel.model.position.y) * 0.15;

  // Make model face camera direction based on movement
  if (Math.abs(targetX - loadedModel.model.position.x) > 0.01) {
    const targetRotation = targetX > loadedModel.model.position.x ? 0.3 : -0.3;
    loadedModel.model.rotation.y +=
      (targetRotation - loadedModel.model.rotation.y) * 0.1;
  }
}

export function playAnimation(loadedModel: LoadedModel, animationName: string) {
  if (!loadedModel.mixer || !loadedModel.animations) return;

  const clip = loadedModel.animations.find(
    (a: any) => a.name.toLowerCase() === animationName.toLowerCase()
  );

  if (!clip) return;

  const THREE = window.THREE;
  const newAction = loadedModel.mixer.clipAction(clip);

  if (loadedModel.currentAction && loadedModel.currentAction !== newAction) {
    loadedModel.currentAction.fadeOut(0.2);
    newAction.reset().fadeIn(0.2).play();
  } else if (!loadedModel.currentAction) {
    newAction.play();
  }

  loadedModel.currentAction = newAction;
}

export function removeModel(loadedModel: LoadedModel, scene: any) {
  if (loadedModel.model) {
    scene.remove(loadedModel.model);
    loadedModel.model.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
  if (loadedModel.mixer) {
    loadedModel.mixer.stopAllAction();
  }
}
