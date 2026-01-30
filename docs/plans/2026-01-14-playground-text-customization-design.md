# Playground Text Customization Design

## Overview

Enhance the playground with text customization options and hand-distance font scaling.

## Features

1. **Text customization** - font, size, effects, font family
2. **Hand-distance scaling** - font size changes based on hand proximity to camera

## Settings Panel Layout

Located to the right of the video element (side-by-side on desktop, stacked on mobile).

```
┌─────────────────────────────────────────────────────────┐
│  Video (640x480)        │  Settings Panel (280px)      │
│                         │  ┌─────────────────────────┐ │
│  [Hand tracking         │  │ TEXT                    │ │
│   video feed]           │  │ ─────────────────────── │ │
│                         │  │ Content: [input field]  │ │
│                         │  │ Font: [dropdown]        │ │
│                         │  │ Size: [━━━●━━] 1.2      │ │
│                         │  │                         │ │
│                         │  │ EFFECTS                 │ │
│                         │  │ ─────────────────────── │ │
│                         │  │ Style: [dropdown]       │ │
│                         │  │ Color: [picker] *       │ │
│                         │  │                         │ │
│                         │  │ INTERACTION             │ │
│                         │  │ ─────────────────────── │ │
│                         │  │ ☑ Hand distance scaling │ │
│                         │  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
* Color picker only visible when "Solid Color" effect selected
```

## Settings Options

### TEXT Section

| Setting | Type | Options/Range | Default |
|---------|------|---------------|---------|
| Content | Text input | Any text, max 20 chars | "Hello" |
| Font Family | Dropdown | Helvetiker, Optimer, Gentilis, Droid Sans | Helvetiker |
| Font Weight | Dropdown | Regular, Bold | Bold |
| Font Size | Slider | 0.5 - 3.0 (step 0.1) | 1.2 |

### EFFECTS Section

| Setting | Type | Options | Default |
|---------|------|---------|---------|
| Style | Dropdown | Rainbow Cycle, Solid Color, Pulse Glow, Metallic, Neon, Wave | Rainbow Cycle |
| Color | Color picker | Any hex color | #ff00ff (magenta) |

Color picker only visible when "Solid Color" is selected.

### INTERACTION Section

| Setting | Type | Default |
|---------|------|---------|
| Hand distance scaling | Checkbox | Off |

## Text Effects

| Effect | Color | Emissive | Animation |
|--------|-------|----------|-----------|
| **Rainbow Cycle** | HSL hue rotates | Matches color, dimmed | Continuous hue shift |
| **Solid Color** | User-picked color | Same color, 30% intensity | None |
| **Pulse Glow** | Magenta | Oscillates 0% - 100% | `sin(time * 3)` brightness |
| **Metallic** | Silver (#c0c0c0) | None | Metalness: 1.0, Roughness: 0.1 |
| **Neon** | Bright color | 100% intensity | Subtle flicker |
| **Wave** | Base color | Shifts across text | `sin(position.x + time)` |

## Hand Distance Scaling Logic

1. Measure distance between wrist (landmark 0) and middle finger MCP (landmark 9)
2. Map detected hand size to scale multiplier:
   - Min hand size (~50px, far) → 0.5x scale
   - Max hand size (~200px, close) → 2.0x scale
3. Smoothing: lerp factor 0.1 to prevent jitter

**Formula:**
```
displaySize = baseFontSize × handDistanceMultiplier
```

When disabled: `handDistanceMultiplier = 1.0`

## File Structure

```
web/src/components/playground/
├── HandTrackingVideo.tsx          (existing - modify)
├── SettingsPanel.tsx              (new - container)
├── settings/
│   ├── index.ts                   (exports)
│   ├── types.ts                   (TypeScript types)
│   ├── usePlaygroundSettings.ts   (localStorage hook)
│   ├── TextContentInput.tsx
│   ├── FontFamilySelect.tsx
│   ├── FontWeightSelect.tsx
│   ├── FontSizeSlider.tsx
│   ├── EffectSelect.tsx
│   ├── ColorPicker.tsx
│   └── HandScalingToggle.tsx
├── effects/
│   ├── index.ts
│   ├── types.ts
│   ├── rainbow.ts
│   ├── solid.ts
│   ├── pulse.ts
│   ├── metallic.ts
│   ├── neon.ts
│   └── wave.ts
└── utils/
    └── handDistance.ts
```

## Types

```typescript
type FontFamily = "helvetiker" | "optimer" | "gentilis" | "droid_sans"
type FontWeight = "regular" | "bold"
type TextEffect = "rainbow" | "solid" | "pulse" | "metallic" | "neon" | "wave"

interface PlaygroundSettings {
  text: string
  fontFamily: FontFamily
  fontWeight: FontWeight
  fontSize: number
  effect: TextEffect
  solidColor: string
  handDistanceScaling: boolean
}
```

## Persistence

- **localStorage key:** `playground-settings`
- Stored as JSON object with all settings values

## Responsive Behavior

- Desktop (≥768px): Side-by-side layout (flex row)
- Mobile (<768px): Stacked layout (flex column), settings below video
