"use client";

import { useState } from "react";
import { getAllAssets, getAssetById } from "@/lib/assets";
import { SelectedAsset, ControlType, CONTROL_TYPES } from "./types";

interface AssetSelectorProps {
  value: SelectedAsset[];
  onChange: (assets: SelectedAsset[]) => void;
}

export function AssetSelector({ value, onChange }: AssetSelectorProps) {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const allAssets = getAllAssets();

  const addAsset = (assetId: string) => {
    const asset = getAssetById(assetId);
    if (!asset) return;

    const instanceId = `${assetId}-${Date.now()}`;
    onChange([
      ...value,
      {
        instanceId,
        assetId,
        controlType: asset.defaultControlType,
        scale: asset.scale,
      },
    ]);
    setSelectedInstanceId(instanceId);
  };

  const removeAsset = (instanceId: string) => {
    onChange(value.filter((a) => a.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  };

  const updateAsset = (instanceId: string, updates: Partial<SelectedAsset>) => {
    onChange(
      value.map((a) =>
        a.instanceId === instanceId ? { ...a, ...updates } : a
      )
    );
  };

  const toggleSelect = (instanceId: string) => {
    setSelectedInstanceId(selectedInstanceId === instanceId ? null : instanceId);
  };

  return (
    <div className="space-y-2">
      {/* Add asset dropdown */}
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) addAsset(e.target.value);
        }}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">+ Add Asset...</option>
        {allAssets.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.name}
          </option>
        ))}
      </select>

      {/* Asset list */}
      {value.length > 0 && (
        <div className="space-y-1">
          {value.map((selected) => {
            const asset = getAssetById(selected.assetId);
            if (!asset) return null;
            const isExpanded = selectedInstanceId === selected.instanceId;

            return (
              <div
                key={selected.instanceId}
                className={`rounded-lg border transition-colors ${
                  isExpanded
                    ? "border-foreground/30 bg-accent/50"
                    : "border-border bg-background hover:bg-accent/30"
                }`}
              >
                {/* Header - always visible */}
                <button
                  onClick={() => toggleSelect(selected.instanceId)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isExpanded ? "bg-foreground" : "bg-muted-foreground/50"
                    }`}
                  />
                  <span className="flex-1 text-sm font-medium">{asset.name}</span>
                  {isExpanded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAsset(selected.instanceId);
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      title="Remove"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </button>

                {/* Settings - only when expanded */}
                {isExpanded && (
                  <div className="space-y-3 border-t border-border px-3 py-3">
                    {/* Control Type */}
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Control
                      </label>
                      <select
                        value={selected.controlType}
                        onChange={(e) =>
                          updateAsset(selected.instanceId, {
                            controlType: e.target.value as ControlType,
                          })
                        }
                        className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
                      >
                        {CONTROL_TYPES.map((ct) => (
                          <option key={ct.value} value={ct.value}>
                            {ct.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Scale */}
                    <div>
                      <label className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Scale</span>
                        <span>{selected.scale.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0.2"
                        max="2"
                        step="0.1"
                        value={selected.scale}
                        onChange={(e) =>
                          updateAsset(selected.instanceId, {
                            scale: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {value.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Add an asset to get started
        </p>
      )}
    </div>
  );
}
