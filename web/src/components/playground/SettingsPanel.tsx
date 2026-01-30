"use client";

import { PlaygroundSettings } from "./settings/types";
import { AssetSelector } from "./settings/AssetSelector";

interface SettingsPanelProps {
  settings: PlaygroundSettings;
  onUpdate: <K extends keyof PlaygroundSettings>(key: K, value: PlaygroundSettings[K]) => void;
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  return (
    <div className="w-[280px] shrink-0 rounded-xl border border-border bg-accent/30 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Assets
      </h3>
      <AssetSelector
        value={settings.selectedAssets}
        onChange={(v) => onUpdate("selectedAssets", v)}
      />
    </div>
  );
}
