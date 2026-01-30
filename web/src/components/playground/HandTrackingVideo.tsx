"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { PlaygroundSettings, SelectedAsset } from "./settings/types";
import { SecurityNotice } from "./SecurityNotice";
import {
  LoadedModel,
  loadModel,
  updateModelPosition,
  removeModel,
} from "./utils/modelLoader";

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    THREE: any;
    GLTFLoader: any;
    FaceMesh: any;
  }
}

interface HandTrackingVideoProps {
  onStatusChange?: (status: string) => void;
  onStop?: () => void;
  settings: PlaygroundSettings;
  expanded?: boolean;
  onExpandToggle?: () => void;
}

export function HandTrackingVideo({ onStatusChange, onStop, settings, expanded, onExpandToggle }: HandTrackingVideoProps) {
  const [status, setStatus] = useState("Loading...");
  const [cameraActive, setCameraActive] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const mediapipeCameraRef = useRef<any>(null);
  const animationRef = useRef<number>(null);

  // Hand tracking refs
  const leftHandTargetRef = useRef({ x: -2, y: 0 });
  const rightHandTargetRef = useRef({ x: 2, y: 0 });
  const leftHandCurrentRef = useRef({ x: -2, y: 0 });
  const rightHandCurrentRef = useRef({ x: 2, y: 0 });
  const leftHandLandmarksRef = useRef<any[]>([]);
  const rightHandLandmarksRef = useRef<any[]>([]);
  const leftHandRotationTargetRef = useRef(0);
  const rightHandRotationTargetRef = useRef(0);
  const leftHandRotationCurrentRef = useRef(0);
  const rightHandRotationCurrentRef = useRef(0);

  // Face tracking refs
  const faceMeshRef = useRef<any>(null);
  const mouthTargetRef = useRef({ x: 0, y: 0 });
  const mouthCurrentRef = useRef({ x: 0, y: 0 });
  const headTargetRef = useRef({ x: 0, y: 0 });
  const headCurrentRef = useRef({ x: 0, y: 0 });
  const topOfHeadTargetRef = useRef({ x: 0, y: 0 });
  const topOfHeadCurrentRef = useRef({ x: 0, y: 0 });

  // Model refs
  const settingsRef = useRef(settings);
  const loadedModelsRef = useRef<Map<string, LoadedModel>>(new Map());
  const modelLoadingRef = useRef<Set<string>>(new Set());

  // Keep settingsRef in sync
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const updateStatus = useCallback(
    (newStatus: string) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  // Calculate palm facing direction from hand landmarks
  // Returns rotation in radians: 0 = palm facing camera, PI = palm facing away
  const calculatePalmRotation = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length < 18) return 0;

    // Key landmarks: wrist (0), index base (5), pinky base (17)
    const wrist = landmarks[0];
    const indexBase = landmarks[5];
    const pinkyBase = landmarks[17];

    // Create vectors from wrist to finger bases
    const v1 = {
      x: indexBase.x - wrist.x,
      y: indexBase.y - wrist.y,
      z: indexBase.z - wrist.z,
    };
    const v2 = {
      x: pinkyBase.x - wrist.x,
      y: pinkyBase.y - wrist.y,
      z: pinkyBase.z - wrist.z,
    };

    // Cross product to get palm normal
    const normal = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x,
    };

    // The Z component of normal indicates palm facing direction
    // Positive Z = palm facing camera, Negative Z = palm facing away
    // Map to rotation: facing camera = PI (back), facing away = 0 (front)
    const rotation = normal.z > 0 ? Math.PI : 0;

    return rotation;
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current || !window.Hands || !window.Camera) return;

    updateStatus("Starting camera...");

    // Initialize Hands
    const hands = new window.Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const lm = results.multiHandLandmarks[i];
          const handedness = results.multiHandedness[i]?.label;
          const finger = lm[8];

          const handX = (1 - finger.x) * 2 - 1;
          const handY = (0.5 - finger.y) * 2;
          const palmRotation = calculatePalmRotation(lm);

          if (handedness === "Left") {
            rightHandTargetRef.current.x = handX * 5;
            rightHandTargetRef.current.y = handY * 4;
            rightHandLandmarksRef.current = lm;
            rightHandRotationTargetRef.current = palmRotation;
          } else {
            leftHandTargetRef.current.x = handX * 5;
            leftHandTargetRef.current.y = handY * 4;
            leftHandLandmarksRef.current = lm;
            leftHandRotationTargetRef.current = palmRotation;
          }
        }

        const handCount = results.multiHandLandmarks.length;
        updateStatus(handCount === 2 ? "Both hands detected" : "Hand detected");
      } else {
        leftHandLandmarksRef.current = [];
        rightHandLandmarksRef.current = [];
        updateStatus("Show your hands");
      }
    });

    handsRef.current = hands;

    // Initialize FaceMesh
    if (window.FaceMesh) {
      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const faceLandmarks = results.multiFaceLandmarks[0];

          // Mouth center
          const upperLip = faceLandmarks[13];
          const lowerLip = faceLandmarks[14];
          const mouthCenterX = (upperLip.x + lowerLip.x) / 2;
          const mouthCenterY = (upperLip.y + lowerLip.y) / 2;
          const mouthX = (1 - mouthCenterX) * 2 - 1;
          const mouthY = (0.5 - mouthCenterY) * 2;
          mouthTargetRef.current.x = mouthX * 5;
          mouthTargetRef.current.y = mouthY * 4;

          // Head position (nose, offset up for hats/helmets)
          const nose = faceLandmarks[1];
          const headX = (1 - nose.x) * 2 - 1;
          const headY = (0.5 - nose.y) * 2;
          headTargetRef.current.x = headX * 5;
          headTargetRef.current.y = headY * 4 + 1.5;

          // Top of head (forehead)
          const forehead = faceLandmarks[10];
          const topX = (1 - forehead.x) * 2 - 1;
          const topY = (0.5 - forehead.y) * 2;
          topOfHeadTargetRef.current.x = topX * 5;
          topOfHeadTargetRef.current.y = topY * 4 + 2;
        }
      });

      faceMeshRef.current = faceMesh;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;

      const cam = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            if (handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          }
        },
        width: 640,
        height: 480,
      });

      cam.start();
      mediapipeCameraRef.current = cam;
      updateStatus("Show your hand");
    } catch (err: any) {
      updateStatus("Camera error: " + err.message);
    }
  }, [updateStatus]);

  const initThreeJS = useCallback(() => {
    if (!canvasRef.current || !window.THREE) return;

    const THREE = window.THREE;
    const width = 640;
    const height = 480;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light1.position.set(5, 5, 5);
    light2.position.set(-5, -5, 5);
    scene.add(light1, light2);

    // Environment map for PBR materials
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x888888);
    const envLight1 = new THREE.DirectionalLight(0xffffff, 1);
    envLight1.position.set(1, 1, 1);
    envScene.add(envLight1);
    const envLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    envLight2.position.set(-1, -1, -1);
    envScene.add(envLight2);
    envScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const envMap = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();

    // Start camera after scene is ready
    startCamera();
    setSceneReady(true);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth position updates
      mouthCurrentRef.current.x += (mouthTargetRef.current.x - mouthCurrentRef.current.x) * 0.15;
      mouthCurrentRef.current.y += (mouthTargetRef.current.y - mouthCurrentRef.current.y) * 0.15;
      headCurrentRef.current.x += (headTargetRef.current.x - headCurrentRef.current.x) * 0.15;
      headCurrentRef.current.y += (headTargetRef.current.y - headCurrentRef.current.y) * 0.15;
      topOfHeadCurrentRef.current.x += (topOfHeadTargetRef.current.x - topOfHeadCurrentRef.current.x) * 0.15;
      topOfHeadCurrentRef.current.y += (topOfHeadTargetRef.current.y - topOfHeadCurrentRef.current.y) * 0.15;
      leftHandCurrentRef.current.x += (leftHandTargetRef.current.x - leftHandCurrentRef.current.x) * 0.15;
      leftHandCurrentRef.current.y += (leftHandTargetRef.current.y - leftHandCurrentRef.current.y) * 0.15;
      rightHandCurrentRef.current.x += (rightHandTargetRef.current.x - rightHandCurrentRef.current.x) * 0.15;
      rightHandCurrentRef.current.y += (rightHandTargetRef.current.y - rightHandCurrentRef.current.y) * 0.15;
      // Smooth rotation updates
      leftHandRotationCurrentRef.current += (leftHandRotationTargetRef.current - leftHandRotationCurrentRef.current) * 0.1;
      rightHandRotationCurrentRef.current += (rightHandRotationTargetRef.current - rightHandRotationCurrentRef.current) * 0.1;

      // Update loaded models
      loadedModelsRef.current.forEach((loadedModel) => {
        if (loadedModel.mixer) {
          loadedModel.mixer.update(delta);
        }

        // Position based on control type
        if (loadedModel.controlType === "bothHands") {
          const avgX = (leftHandCurrentRef.current.x + rightHandCurrentRef.current.x) / 2;
          const avgY = (leftHandCurrentRef.current.y + rightHandCurrentRef.current.y) / 2;
          updateModelPosition(loadedModel, { x: avgX, y: avgY });
          const handSpread = rightHandCurrentRef.current.x - leftHandCurrentRef.current.x;
          if (loadedModel.model) {
            loadedModel.model.rotation.y = handSpread * 0.1;
          }
        } else if (loadedModel.controlType === "rightHand") {
          updateModelPosition(loadedModel, rightHandCurrentRef.current, rightHandLandmarksRef.current);
          // Apply palm rotation to character Y-axis
          if (loadedModel.model) {
            loadedModel.model.rotation.y = rightHandRotationCurrentRef.current;
          }
        } else if (loadedModel.controlType === "leftHand") {
          updateModelPosition(loadedModel, leftHandCurrentRef.current, leftHandLandmarksRef.current);
          // Apply palm rotation to character Y-axis
          if (loadedModel.model) {
            loadedModel.model.rotation.y = leftHandRotationCurrentRef.current;
          }
        } else if (loadedModel.controlType === "mouth") {
          updateModelPosition(loadedModel, mouthCurrentRef.current);
        } else if (loadedModel.controlType === "head") {
          updateModelPosition(loadedModel, headCurrentRef.current);
        } else if (loadedModel.controlType === "topOfHead") {
          updateModelPosition(loadedModel, topOfHeadCurrentRef.current);
        } else {
          updateModelPosition(loadedModel, { x: 0, y: 0 });
        }
      });

      renderer.render(scene, camera);
    };
    animate();
  }, [startCamera]);

  // Initialize on mount
  useEffect(() => {
    const timer = setTimeout(initThreeJS, 100);
    return () => clearTimeout(timer);
  }, [initThreeJS]);

  // Handle asset loading/unloading
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return;

    const scene = sceneRef.current;
    const currentInstanceIds = new Set(loadedModelsRef.current.keys());
    const selectedInstanceIds = new Set(settings.selectedAssets.map((a) => a.instanceId));

    // Remove assets no longer selected
    currentInstanceIds.forEach((instanceId) => {
      if (!selectedInstanceIds.has(instanceId)) {
        const model = loadedModelsRef.current.get(instanceId);
        if (model) {
          removeModel(model, scene);
          loadedModelsRef.current.delete(instanceId);
        }
      }
    });

    // Load new assets or update existing
    settings.selectedAssets.forEach(async (selected: SelectedAsset) => {
      const existing = loadedModelsRef.current.get(selected.instanceId);

      if (existing) {
        // Update control type and scale if changed
        existing.controlType = selected.controlType;
        if (existing.model) {
          existing.model.scale.setScalar(selected.scale);
        }
        return;
      }

      if (modelLoadingRef.current.has(selected.instanceId)) return;

      modelLoadingRef.current.add(selected.instanceId);
      try {
        const loaded = await loadModel(selected.assetId, selected.controlType, scene, selected.scale);
        if (loaded) {
          loadedModelsRef.current.set(selected.instanceId, loaded);
        }
      } catch (err) {
        console.error(`Failed to load asset ${selected.assetId}:`, err);
      } finally {
        modelLoadingRef.current.delete(selected.instanceId);
      }
    });
  }, [sceneReady, settings.selectedAssets]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mediapipeCameraRef.current) {
        mediapipeCameraRef.current.stop();
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (sceneRef.current) {
        loadedModelsRef.current.forEach((model) => {
          removeModel(model, sceneRef.current);
        });
        loadedModelsRef.current.clear();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const toggleCamera = () => {
    if (cameraActive) {
      // Pause camera
      if (mediapipeCameraRef.current) {
        mediapipeCameraRef.current.stop();
      }
      setCameraActive(false);
      setStatus("Camera paused");
    } else {
      // Resume camera
      if (mediapipeCameraRef.current && videoRef.current) {
        mediapipeCameraRef.current.start();
      }
      setCameraActive(true);
      setStatus("Show your hands");
    }
  };

  const handleStop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (mediapipeCameraRef.current) {
      mediapipeCameraRef.current.stop();
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    if (sceneRef.current) {
      loadedModelsRef.current.forEach((model) => {
        removeModel(model, sceneRef.current);
      });
      loadedModelsRef.current.clear();
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    onStop?.();
  };

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status.includes("detected")
              ? "bg-green-500/20 text-green-500"
              : status === "Camera paused"
              ? "bg-blue-500/20 text-blue-500"
              : "bg-yellow-500/20 text-yellow-500"
          }`}
        >
          {status}
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleCamera}
            className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              cameraActive
                ? "border-border hover:bg-accent"
                : "border-blue-500 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
            }`}
          >
            {cameraActive ? "Pause Camera" : "Resume Camera"}
          </button>
          {/* TODO: Fix expand bug and re-enable */}
          {false && onExpandToggle && (
            <button
              onClick={onExpandToggle}
              className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
          <button
            onClick={handleStop}
            className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Webcam container */}
      <div
        ref={containerRef}
        className={`relative mx-auto overflow-hidden rounded-xl border-4 border-green-500 ${
          expanded ? "h-[calc(100vh-120px)] w-full" : ""
        }`}
        style={expanded ? undefined : { width: 640, height: 480 }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute h-full w-full scale-x-[-1] object-cover"
        />
        <canvas
          ref={canvasRef}
          width={expanded ? 1280 : 640}
          height={expanded ? 960 : 480}
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
        />
      </div>

      {!expanded && (
        <>
          <p className="text-center text-sm text-muted-foreground">
            Add assets and control them with your hands or face
          </p>
          <SecurityNotice compact />
        </>
      )}
    </div>
  );
}
