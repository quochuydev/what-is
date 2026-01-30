# Playground Text Customization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add text customization settings panel and hand-distance font scaling to the playground.

**Architecture:** Modular component structure with isolated settings components, effect functions, and a shared hook for localStorage persistence. Settings panel sits beside video element.

**Tech Stack:** React, TypeScript, Three.js, Tailwind CSS, localStorage

---

## Task 1: Settings Types

**Files:**
- Create: `web/src/components/playground/settings/types.ts`

```typescript
export type FontFamily = "helvetiker" | "optimer" | "gentilis" | "droid_sans";
export type FontWeight = "regular" | "bold";
export type TextEffect = "rainbow" | "solid" | "pulse" | "metallic" | "neon" | "wave";

export interface PlaygroundSettings {
  text: string;
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  fontSize: number;
  effect: TextEffect;
  solidColor: string;
  handDistanceScaling: boolean;
}

export const DEFAULT_SETTINGS: PlaygroundSettings = {
  text: "Hello",
  fontFamily: "helvetiker",
  fontWeight: "bold",
  fontSize: 1.2,
  effect: "rainbow",
  solidColor: "#ff00ff",
  handDistanceScaling: false,
};

export const FONT_FAMILIES: { value: FontFamily; label: string }[] = [
  { value: "helvetiker", label: "Helvetiker" },
  { value: "optimer", label: "Optimer" },
  { value: "gentilis", label: "Gentilis" },
  { value: "droid_sans", label: "Droid Sans" },
];

export const FONT_WEIGHTS: { value: FontWeight; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "bold", label: "Bold" },
];

export const TEXT_EFFECTS: { value: TextEffect; label: string }[] = [
  { value: "rainbow", label: "Rainbow Cycle" },
  { value: "solid", label: "Solid Color" },
  { value: "pulse", label: "Pulse Glow" },
  { value: "metallic", label: "Metallic" },
  { value: "neon", label: "Neon" },
  { value: "wave", label: "Wave" },
];
```

---

## Task 2: localStorage Hook

**Files:**
- Create: `web/src/components/playground/settings/usePlaygroundSettings.ts`

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { PlaygroundSettings, DEFAULT_SETTINGS } from "./types";

const STORAGE_KEY = "playground-settings";

export function usePlaygroundSettings() {
  const [settings, setSettings] = useState<PlaygroundSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, loaded]);

  const updateSetting = useCallback(
    <K extends keyof PlaygroundSettings>(key: K, value: PlaygroundSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return { settings, updateSetting, loaded };
}
```

---

## Task 3: TextContentInput Component

**Files:**
- Create: `web/src/components/playground/settings/TextContentInput.tsx`

```typescript
"use client";

interface TextContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextContentInput({ value, onChange }: TextContentInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Content</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        maxLength={20}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        placeholder="Enter text..."
      />
    </div>
  );
}
```

---

## Task 4: FontFamilySelect Component

**Files:**
- Create: `web/src/components/playground/settings/FontFamilySelect.tsx`

```typescript
"use client";

import { FontFamily, FONT_FAMILIES } from "./types";

interface FontFamilySelectProps {
  value: FontFamily;
  onChange: (value: FontFamily) => void;
}

export function FontFamilySelect({ value, onChange }: FontFamilySelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Font Family</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FontFamily)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## Task 5: FontWeightSelect Component

**Files:**
- Create: `web/src/components/playground/settings/FontWeightSelect.tsx`

```typescript
"use client";

import { FontWeight, FONT_WEIGHTS } from "./types";

interface FontWeightSelectProps {
  value: FontWeight;
  onChange: (value: FontWeight) => void;
}

export function FontWeightSelect({ value, onChange }: FontWeightSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Font Weight</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FontWeight)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      >
        {FONT_WEIGHTS.map((weight) => (
          <option key={weight.value} value={weight.value}>
            {weight.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## Task 6: FontSizeSlider Component

**Files:**
- Create: `web/src/components/playground/settings/FontSizeSlider.tsx`

```typescript
"use client";

interface FontSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function FontSizeSlider({ value, onChange }: FontSizeSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Font Size</label>
        <span className="text-xs text-muted-foreground">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={0.5}
        max={3}
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-foreground"
      />
    </div>
  );
}
```

---

## Task 7: EffectSelect Component

**Files:**
- Create: `web/src/components/playground/settings/EffectSelect.tsx`

```typescript
"use client";

import { TextEffect, TEXT_EFFECTS } from "./types";

interface EffectSelectProps {
  value: TextEffect;
  onChange: (value: TextEffect) => void;
}

export function EffectSelect({ value, onChange }: EffectSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Effect Style</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TextEffect)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
      >
        {TEXT_EFFECTS.map((effect) => (
          <option key={effect.value} value={effect.value}>
            {effect.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## Task 8: ColorPicker Component

**Files:**
- Create: `web/src/components/playground/settings/ColorPicker.tsx`

```typescript
"use client";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Color</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm uppercase focus:border-foreground focus:outline-none"
          placeholder="#ff00ff"
        />
      </div>
    </div>
  );
}
```

---

## Task 9: HandScalingToggle Component

**Files:**
- Create: `web/src/components/playground/settings/HandScalingToggle.tsx`

```typescript
"use client";

interface HandScalingToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function HandScalingToggle({ value, onChange }: HandScalingToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-foreground"
      />
      <span className="text-sm">Hand distance scaling</span>
    </label>
  );
}
```

---

## Task 10: Settings Index Export

**Files:**
- Create: `web/src/components/playground/settings/index.ts`

```typescript
export * from "./types";
export * from "./usePlaygroundSettings";
export * from "./TextContentInput";
export * from "./FontFamilySelect";
export * from "./FontWeightSelect";
export * from "./FontSizeSlider";
export * from "./EffectSelect";
export * from "./ColorPicker";
export * from "./HandScalingToggle";
```

---

## Task 11: SettingsPanel Container

**Files:**
- Create: `web/src/components/playground/SettingsPanel.tsx`

```typescript
"use client";

import { PlaygroundSettings } from "./settings/types";
import { TextContentInput } from "./settings/TextContentInput";
import { FontFamilySelect } from "./settings/FontFamilySelect";
import { FontWeightSelect } from "./settings/FontWeightSelect";
import { FontSizeSlider } from "./settings/FontSizeSlider";
import { EffectSelect } from "./settings/EffectSelect";
import { ColorPicker } from "./settings/ColorPicker";
import { HandScalingToggle } from "./settings/HandScalingToggle";

interface SettingsPanelProps {
  settings: PlaygroundSettings;
  onUpdate: <K extends keyof PlaygroundSettings>(key: K, value: PlaygroundSettings[K]) => void;
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  return (
    <div className="w-[280px] shrink-0 rounded-xl border border-border bg-accent/30 p-4">
      {/* TEXT Section */}
      <div className="mb-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Text
        </h3>
        <div className="space-y-3">
          <TextContentInput
            value={settings.text}
            onChange={(v) => onUpdate("text", v)}
          />
          <FontFamilySelect
            value={settings.fontFamily}
            onChange={(v) => onUpdate("fontFamily", v)}
          />
          <FontWeightSelect
            value={settings.fontWeight}
            onChange={(v) => onUpdate("fontWeight", v)}
          />
          <FontSizeSlider
            value={settings.fontSize}
            onChange={(v) => onUpdate("fontSize", v)}
          />
        </div>
      </div>

      {/* EFFECTS Section */}
      <div className="mb-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Effects
        </h3>
        <div className="space-y-3">
          <EffectSelect
            value={settings.effect}
            onChange={(v) => onUpdate("effect", v)}
          />
          {settings.effect === "solid" && (
            <ColorPicker
              value={settings.solidColor}
              onChange={(v) => onUpdate("solidColor", v)}
            />
          )}
        </div>
      </div>

      {/* INTERACTION Section */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Interaction
        </h3>
        <HandScalingToggle
          value={settings.handDistanceScaling}
          onChange={(v) => onUpdate("handDistanceScaling", v)}
        />
      </div>
    </div>
  );
}
```

---

## Task 12: Effect Types

**Files:**
- Create: `web/src/components/playground/effects/types.ts`

```typescript
export interface EffectContext {
  material: any; // THREE.MeshStandardMaterial
  time: number;
  solidColor: string;
}

export type EffectFunction = (ctx: EffectContext) => void;
```

---

## Task 13: Rainbow Effect

**Files:**
- Create: `web/src/components/playground/effects/rainbow.ts`

```typescript
import { EffectFunction } from "./types";

export const rainbowEffect: EffectFunction = ({ material, time }) => {
  const hue = (time * 0.1) % 1;
  material.color.setHSL(hue, 1, 0.5);
  material.emissive.setHSL(hue, 1, 0.15);
  material.metalness = 0.7;
  material.roughness = 0.3;
};
```

---

## Task 14: Solid Effect

**Files:**
- Create: `web/src/components/playground/effects/solid.ts`

```typescript
import { EffectFunction } from "./types";

export const solidEffect: EffectFunction = ({ material, solidColor }) => {
  material.color.set(solidColor);
  material.emissive.set(solidColor);
  material.emissiveIntensity = 0.3;
  material.metalness = 0.7;
  material.roughness = 0.3;
};
```

---

## Task 15: Pulse Effect

**Files:**
- Create: `web/src/components/playground/effects/pulse.ts`

```typescript
import { EffectFunction } from "./types";

export const pulseEffect: EffectFunction = ({ material, time }) => {
  const pulse = (Math.sin(time * 3) + 1) / 2; // 0 to 1
  material.color.set(0xff00ff);
  material.emissive.set(0xff00ff);
  material.emissiveIntensity = pulse;
  material.metalness = 0.7;
  material.roughness = 0.3;
};
```

---

## Task 16: Metallic Effect

**Files:**
- Create: `web/src/components/playground/effects/metallic.ts`

```typescript
import { EffectFunction } from "./types";

export const metallicEffect: EffectFunction = ({ material }) => {
  material.color.set(0xc0c0c0);
  material.emissive.set(0x000000);
  material.emissiveIntensity = 0;
  material.metalness = 1.0;
  material.roughness = 0.1;
};
```

---

## Task 17: Neon Effect

**Files:**
- Create: `web/src/components/playground/effects/neon.ts`

```typescript
import { EffectFunction } from "./types";

export const neonEffect: EffectFunction = ({ material, time }) => {
  const flicker = 0.9 + Math.random() * 0.1; // Subtle flicker
  material.color.set(0x00ffff);
  material.emissive.set(0x00ffff);
  material.emissiveIntensity = flicker;
  material.metalness = 0.3;
  material.roughness = 0.5;
};
```

---

## Task 18: Wave Effect

**Files:**
- Create: `web/src/components/playground/effects/wave.ts`

```typescript
import { EffectFunction } from "./types";

export const waveEffect: EffectFunction = ({ material, time }) => {
  const wave = (Math.sin(time * 2) + 1) / 2;
  const hue = 0.8 + wave * 0.2; // Purple to pink range
  material.color.setHSL(hue % 1, 1, 0.5);
  material.emissive.setHSL(hue % 1, 1, 0.2);
  material.metalness = 0.7;
  material.roughness = 0.3;
};
```

---

## Task 19: Effects Index

**Files:**
- Create: `web/src/components/playground/effects/index.ts`

```typescript
import { TextEffect } from "../settings/types";
import { EffectFunction } from "./types";
import { rainbowEffect } from "./rainbow";
import { solidEffect } from "./solid";
import { pulseEffect } from "./pulse";
import { metallicEffect } from "./metallic";
import { neonEffect } from "./neon";
import { waveEffect } from "./wave";

export const effects: Record<TextEffect, EffectFunction> = {
  rainbow: rainbowEffect,
  solid: solidEffect,
  pulse: pulseEffect,
  metallic: metallicEffect,
  neon: neonEffect,
  wave: waveEffect,
};

export * from "./types";
```

---

## Task 20: Hand Distance Utility

**Files:**
- Create: `web/src/components/playground/utils/handDistance.ts`

```typescript
// Landmarks: 0 = wrist, 9 = middle finger MCP
const MIN_HAND_SIZE = 50; // pixels (far)
const MAX_HAND_SIZE = 200; // pixels (close)
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;

export function calculateHandScale(landmarks: any[], canvasWidth: number): number {
  if (!landmarks || landmarks.length < 10) return 1.0;

  const wrist = landmarks[0];
  const middleMcp = landmarks[9];

  // Calculate pixel distance
  const dx = (wrist.x - middleMcp.x) * canvasWidth;
  const dy = (wrist.y - middleMcp.y) * canvasWidth;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Normalize to scale factor
  const normalized = (distance - MIN_HAND_SIZE) / (MAX_HAND_SIZE - MIN_HAND_SIZE);
  const clamped = Math.max(0, Math.min(1, normalized));

  return MIN_SCALE + clamped * (MAX_SCALE - MIN_SCALE);
}

// Smooth the scale value to prevent jitter
let smoothedScale = 1.0;
const LERP_FACTOR = 0.1;

export function getSmoothedHandScale(landmarks: any[], canvasWidth: number): number {
  const targetScale = calculateHandScale(landmarks, canvasWidth);
  smoothedScale += (targetScale - smoothedScale) * LERP_FACTOR;
  return smoothedScale;
}

export function resetSmoothedScale(): void {
  smoothedScale = 1.0;
}
```

---

## Task 21: Update HandTrackingVideo Component

**Files:**
- Modify: `web/src/components/playground/HandTrackingVideo.tsx`

**Step 1: Update imports and props interface**

Add to top of file after existing imports:

```typescript
import { PlaygroundSettings } from "./settings/types";
import { effects } from "./effects";
import { getSmoothedHandScale, resetSmoothedScale } from "./utils/handDistance";
```

Update interface:

```typescript
interface HandTrackingVideoProps {
  onStatusChange?: (status: string) => void;
  onStop?: () => void;
  settings: PlaygroundSettings;
}
```

Update function signature:

```typescript
export function HandTrackingVideo({ onStatusChange, onStop, settings }: HandTrackingVideoProps) {
```

**Step 2: Add refs for hand landmarks and scale**

Add after `currentRef`:

```typescript
const landmarksRef = useRef<any[]>([]);
const handScaleRef = useRef(1.0);
```

**Step 3: Update hand results callback**

Replace the `hands.onResults` callback (lines 59-75) with:

```typescript
hands.onResults((results: any) => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0];
    landmarksRef.current = lm;
    const finger = lm[8]; // Index finger tip

    // Convert to Three.js coordinates
    const handX = (1 - finger.x) * 2 - 1;
    const handY = (0.5 - finger.y) * 2;

    targetRef.current.x = handX * 5;
    targetRef.current.y = handY * 4;

    // Calculate hand scale if enabled
    if (settings.handDistanceScaling) {
      handScaleRef.current = getSmoothedHandScale(lm, 640);
    } else {
      handScaleRef.current = 1.0;
    }

    updateStatus("Hand detected");
  } else {
    landmarksRef.current = [];
    updateStatus("Show your hand");
  }
});
```

**Step 4: Update font URL builder**

Create font URL builder function before `initThreeJS`:

```typescript
const getFontUrl = useCallback(() => {
  const base = "https://threejs.org/examples/fonts/";
  const family = settings.fontFamily === "droid_sans" ? "droid/droid_sans" : settings.fontFamily;
  const weight = settings.fontWeight;
  return `${base}${family}_${weight}.typeface.json`;
}, [settings.fontFamily, settings.fontWeight]);
```

**Step 5: Update text geometry creation**

Replace the font loader section (lines 138-168) with:

```typescript
// Load font and create text
const loader = new THREE.FontLoader();
loader.load(getFontUrl(), (font: any) => {
  const geo = new THREE.TextGeometry(settings.text || "Hello", {
    font,
    size: settings.fontSize,
    height: 0.3,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.02,
    bevelSegments: 5,
  });
  geo.computeBoundingBox();
  geo.center();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xff00ff,
    emissive: 0x330033,
    metalness: 0.7,
    roughness: 0.3,
  });

  const textMesh = new THREE.Mesh(geo, mat);
  scene.add(textMesh);
  textMeshRef.current = textMesh;

  startCamera();
});
```

**Step 6: Update animation loop effects**

Replace the color cycle section (lines 194-197) with:

```typescript
// Apply selected effect
const effectFn = effects[settings.effect];
if (effectFn) {
  effectFn({
    material: textMeshRef.current.material,
    time: t,
    solidColor: settings.solidColor,
  });
}

// Apply hand distance scaling
const baseScale = 1 + Math.sin(t * 3) * 0.03;
const finalScale = baseScale * handScaleRef.current;
textMeshRef.current.scale.set(finalScale, finalScale, finalScale);
```

**Step 7: Add cleanup for smoothed scale**

Add to cleanup effect (after line 227):

```typescript
resetSmoothedScale();
```

Also add to handleStop function.

**Step 8: Add dependencies to useCallback**

Update `initThreeJS` dependencies to include settings:

```typescript
}, [startCamera, getFontUrl, settings.text, settings.fontSize, settings.effect, settings.solidColor]);
```

---

## Task 22: Update Playground Page Layout

**Files:**
- Modify: `web/src/app/playground/page.tsx`

**Step 1: Add imports**

Add after existing imports:

```typescript
import { SettingsPanel } from "@/components/playground/SettingsPanel";
import { usePlaygroundSettings } from "@/components/playground/settings";
```

**Step 2: Add settings hook in PlaygroundContent**

Add inside `PlaygroundContent` after other state declarations:

```typescript
const { settings, updateSetting, loaded: settingsLoaded } = usePlaygroundSettings();
```

**Step 3: Update the session started view**

Replace line 307:

```typescript
<HandTrackingVideo onStop={handleStopSession} />
```

With:

```typescript
<div className="flex flex-col gap-4 lg:flex-row">
  <HandTrackingVideo onStop={handleStopSession} settings={settings} />
  <SettingsPanel settings={settings} onUpdate={updateSetting} />
</div>
```

---

## Task 23: Manual Testing

**Step 1: Start dev server**

```bash
cd web && npm run dev
```

**Step 2: Test checklist**

- [ ] Navigate to /playground
- [ ] Start a session
- [ ] Verify settings panel appears next to video
- [ ] Test text content change
- [ ] Test font family dropdown
- [ ] Test font weight dropdown
- [ ] Test font size slider
- [ ] Test each effect (rainbow, solid, pulse, metallic, neon, wave)
- [ ] Test color picker (visible only with solid effect)
- [ ] Test hand distance scaling toggle
- [ ] Refresh page - verify settings persist

---

## Summary

| Task | Component | Files |
|------|-----------|-------|
| 1 | Settings Types | `settings/types.ts` |
| 2 | localStorage Hook | `settings/usePlaygroundSettings.ts` |
| 3-9 | Settings Components | 7 individual components |
| 10 | Settings Index | `settings/index.ts` |
| 11 | Settings Panel | `SettingsPanel.tsx` |
| 12-18 | Effects | 6 effect files + types |
| 19 | Effects Index | `effects/index.ts` |
| 20 | Hand Distance | `utils/handDistance.ts` |
| 21 | HandTrackingVideo | Modify existing |
| 22 | Page Layout | Modify existing |
| 23 | Manual Testing | Verify all features |
