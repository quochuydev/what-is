# Playground GLB Assets Design

## Summary

Simplify playground to support GLB models only. Remove effects and text. Each asset has individual settings (scale, control type). Users can add multiple instances of the same asset.

## Data Structure

```typescript
interface SelectedAsset {
  instanceId: string;       // Unique ID (allows duplicates)
  assetId: string;          // Reference to asset (e.g., "xbot", "soldier")
  controlType: ControlType;
  scale: number;            // 0.5 - 2.0, default 1.0
}

interface PlaygroundSettings {
  selectedAssets: SelectedAsset[];
}
```

## UI Design

```
┌─────────────────────────────┐
│ Assets                      │
│ ┌─────────────────────────┐ │
│ │ + Add Asset...        ▼ │ │  <- Dropdown (all GLB models)
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ○ Xbot                  │ │  <- Compact (unselected)
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ● Snow            [✕]   │ │  <- Selected (expanded)
│ │ ─────────────────────── │ │
│ │ Control: [Position  ▼]  │ │
│ │ Scale:   ──────●──      │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ○ Flying Saucer         │ │  <- Compact (unselected)
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

- Dropdown to add assets
- Compact list of added assets
- Click to select → shows settings inline
- Only one expanded at a time
- [✕] delete on selected item

## Files to Remove

- `lib/assets/effects/` - Snow, Fire, Water, Waves, Xmas
- `lib/assets/text/` - NeonText
- `components/playground/effects/` - text effects (rainbow, neon, etc.)

## Files to Modify

- `lib/assets/index.ts` - only export models
- `lib/assets/types.ts` - remove effect/text types
- `components/playground/settings/types.ts` - new SelectedAsset, simplified PlaygroundSettings
- `components/playground/SettingsPanel.tsx` - single AssetSelector component
- `components/playground/settings/ModelSelector.tsx` → `AssetSelector.tsx`
- `components/playground/HandTrackingVideo.tsx` - remove text rendering
- `components/threejs/Sidebar.tsx` - only models category

## Files to Keep

- `lib/assets/models/` - all GLB model components
- `components/playground/utils/modelLoader.ts` - GLB loading utilities
