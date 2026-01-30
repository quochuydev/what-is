# /threejs Page Design

## Purpose

A development workbench for creating and previewing reusable 3D components that can be used in `/playground`.

## Tech Stack

- **React Three Fiber (R3F)** - React renderer for Three.js
- **@react-three/drei** - Helper components (OrbitControls, Environment, loaders)
- **npm packages** (not CDN) - Better for tree-shaking and TypeScript

## Layout

```
┌─────────────────────────────────────────────────┐
│  Header                                         │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│   Sidebar    │         Canvas Area              │
│   (250px)    │      (remaining width)           │
│              │                                  │
│  - Effects   │    ┌────────────────────┐        │
│    • Snow    │    │                    │        │
│    • Fire    │    │   R3F <Canvas />   │        │
│              │    │                    │        │
│  - Models    │    │   Selected demo    │        │
│    • Robot   │    │   renders here     │        │
│              │    │                    │        │
│  - Text      │    └────────────────────┘        │
│    • Neon    │                                  │
│              │    Component name + description  │
├──────────────┴──────────────────────────────────┤
│  Footer                                         │
└─────────────────────────────────────────────────┘
```

## File Structure

```
web/src/app/threejs/
  page.tsx                    # Main page with sidebar + canvas

web/src/components/threejs/
  Canvas3D.tsx                # R3F Canvas wrapper with controls
  Sidebar.tsx                 # Category list with demo items

  demos/                      # Reusable 3D components
    index.ts                  # Registry of all demos
    effects/
      Snow.tsx
    text/
      NeonText.tsx
```

## Component Pattern

Each demo component follows this pattern:

```tsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function Snow({ count = 1000, speed = 0.5 }) {
  const ref = useRef();
  useFrame((state, delta) => {
    // Animation logic
  });
  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial size={0.05} color="white" />
    </points>
  );
}

Snow.displayName = 'Snow';
Snow.description = 'Falling snow particles';
Snow.category = 'effects';
```

## Demo Registry

```tsx
// web/src/components/threejs/demos/index.ts
export const demos = {
  effects: [Snow],
  text: [NeonText],
};
```

Add new file → export in registry → appears in sidebar automatically.

## Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

## Starter Demos

1. **Snow** - Particle effect (good template for effects)
2. **NeonText** - 3D text with glow (similar to playground)

## Notes

- Keep `/playground` with raw Three.js for now
- Migrate playground to R3F later if pattern works well
- Public page, no auth required
