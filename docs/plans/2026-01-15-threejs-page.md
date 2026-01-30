# /threejs Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a public `/threejs` page with React Three Fiber for creating and previewing reusable 3D components.

**Architecture:** Sidebar-canvas layout with modular demo components. Each 3D demo is a self-contained R3F component registered in a central registry. Selecting from sidebar renders the component in the canvas.

**Tech Stack:** React Three Fiber, @react-three/drei, Three.js, TypeScript

---

## Task 1: Install Dependencies

**Files:**
- Modify: `web/package.json`

**Step 1: Install R3F packages**

Run from `web/` directory:
```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

**Step 2: Verify installation**

Run: `npm ls three @react-three/fiber @react-three/drei`
Expected: All three packages listed with versions

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-three-fiber dependencies"
```

---

## Task 2: Create Demo Registry Types

**Files:**
- Create: `web/src/components/threejs/demos/types.ts`

**Step 1: Create types file**

```typescript
import { FC } from 'react';

export interface DemoComponentProps {
  // Common props all demos can receive
}

export interface DemoComponent extends FC<DemoComponentProps> {
  displayName: string;
  description: string;
  category: string;
}

export interface DemoRegistry {
  [category: string]: DemoComponent[];
}
```

**Step 2: Commit**

```bash
git add web/src/components/threejs/demos/types.ts
git commit -m "feat(threejs): add demo component types"
```

---

## Task 3: Create Snow Effect Demo

**Files:**
- Create: `web/src/components/threejs/demos/effects/Snow.tsx`

**Step 1: Create Snow component**

```tsx
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { DemoComponent } from '../types';

const Snow: DemoComponent = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 2000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 10 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posArray = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= delta * 2;
      if (posArray[i * 3 + 1] < -2) {
        posArray[i * 3 + 1] = 8;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
};

Snow.displayName = 'Snow';
Snow.description = 'Falling snow particles effect';
Snow.category = 'effects';

export { Snow };
```

**Step 2: Commit**

```bash
git add web/src/components/threejs/demos/effects/Snow.tsx
git commit -m "feat(threejs): add Snow particle effect demo"
```

---

## Task 4: Create NeonText Demo

**Files:**
- Create: `web/src/components/threejs/demos/text/NeonText.tsx`

**Step 1: Create NeonText component**

```tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { DemoComponent } from '../types';

const NeonText: DemoComponent = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <Center>
      <Text3D
        ref={meshRef}
        font="/fonts/helvetiker_bold.typeface.json"
        size={0.8}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelSegments={5}
      >
        Hello
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Text3D>
    </Center>
  );
};

NeonText.displayName = 'NeonText';
NeonText.description = '3D text with neon glow effect';
NeonText.category = 'text';

export { NeonText };
```

**Step 2: Download font file**

Run:
```bash
mkdir -p web/public/fonts
curl -o web/public/fonts/helvetiker_bold.typeface.json https://threejs.org/examples/fonts/helvetiker_bold.typeface.json
```

**Step 3: Commit**

```bash
git add web/src/components/threejs/demos/text/NeonText.tsx web/public/fonts/
git commit -m "feat(threejs): add NeonText demo with font"
```

---

## Task 5: Create Demo Registry

**Files:**
- Create: `web/src/components/threejs/demos/index.ts`

**Step 1: Create registry**

```typescript
import { Snow } from './effects/Snow';
import { NeonText } from './text/NeonText';
import { DemoRegistry } from './types';

export const demos: DemoRegistry = {
  effects: [Snow],
  text: [NeonText],
};

export const getAllDemos = () => {
  return Object.values(demos).flat();
};

export const findDemo = (name: string) => {
  return getAllDemos().find((demo) => demo.displayName === name);
};
```

**Step 2: Commit**

```bash
git add web/src/components/threejs/demos/index.ts
git commit -m "feat(threejs): add demo registry"
```

---

## Task 6: Create Canvas3D Wrapper

**Files:**
- Create: `web/src/components/threejs/Canvas3D.tsx`

**Step 1: Create Canvas wrapper**

```tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense, ReactNode } from 'react';

interface Canvas3DProps {
  children: ReactNode;
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

export function Canvas3D({ children }: Canvas3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: '#0a0a0a' }}
    >
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        <Environment preset="city" />
        {children}
      </Suspense>
    </Canvas>
  );
}
```

**Step 2: Commit**

```bash
git add web/src/components/threejs/Canvas3D.tsx
git commit -m "feat(threejs): add Canvas3D wrapper component"
```

---

## Task 7: Create Sidebar Component

**Files:**
- Create: `web/src/components/threejs/Sidebar.tsx`

**Step 1: Create Sidebar**

```tsx
'use client';

import { DemoRegistry } from './demos/types';

interface SidebarProps {
  demos: DemoRegistry;
  active: string;
  onSelect: (name: string) => void;
}

export function Sidebar({ demos, active, onSelect }: SidebarProps) {
  return (
    <aside className="w-[250px] border-r border-border bg-background p-4 overflow-y-auto">
      <h2 className="mb-4 text-lg font-semibold">3D Demos</h2>
      <nav className="space-y-4">
        {Object.entries(demos).map(([category, components]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {category}
            </h3>
            <ul className="space-y-1">
              {components.map((component) => (
                <li key={component.displayName}>
                  <button
                    onClick={() => onSelect(component.displayName)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      active === component.displayName
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    {component.displayName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

**Step 2: Commit**

```bash
git add web/src/components/threejs/Sidebar.tsx
git commit -m "feat(threejs): add Sidebar component"
```

---

## Task 8: Create /threejs Page

**Files:**
- Create: `web/src/app/threejs/page.tsx`

**Step 1: Create page**

```tsx
'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Canvas3D } from '@/components/threejs/Canvas3D';
import { Sidebar } from '@/components/threejs/Sidebar';
import { demos, findDemo } from '@/components/threejs/demos';

export default function ThreeJSPage() {
  const [activeDemo, setActiveDemo] = useState('Snow');

  const DemoComponent = findDemo(activeDemo);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar demos={demos} active={activeDemo} onSelect={setActiveDemo} />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1 overflow-hidden rounded-xl border border-border">
            <Canvas3D>
              {DemoComponent && <DemoComponent />}
            </Canvas3D>
          </div>
          {DemoComponent && (
            <div className="mt-3">
              <h2 className="text-lg font-semibold">{DemoComponent.displayName}</h2>
              <p className="text-sm text-muted-foreground">
                {DemoComponent.description}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add web/src/app/threejs/page.tsx
git commit -m "feat(threejs): add /threejs page"
```

---

## Task 9: Test the Page

**Step 1: Start dev server**

Run from `web/` directory:
```bash
npm run dev
```

**Step 2: Verify in browser**

Open: `http://localhost:3000/threejs`

Expected:
- Header and Footer render correctly
- Sidebar shows "effects" category with "Snow" item
- Sidebar shows "text" category with "NeonText" item
- Canvas shows falling snow particles
- Click "NeonText" to see 3D text with glow
- Orbit controls work (drag to rotate, scroll to zoom)

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(threejs): complete /threejs page implementation"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Install R3F dependencies |
| 2 | Create demo component types |
| 3 | Create Snow effect demo |
| 4 | Create NeonText demo |
| 5 | Create demo registry |
| 6 | Create Canvas3D wrapper |
| 7 | Create Sidebar component |
| 8 | Create /threejs page |
| 9 | Test the page |
