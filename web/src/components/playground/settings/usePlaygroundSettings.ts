"use client";

import { useState, useEffect, useCallback } from "react";
import { PlaygroundSettings, DEFAULT_SETTINGS } from "./types";

const STORAGE_KEY = "playground-settings";

export function usePlaygroundSettings() {
  const [settings, setSettings] = useState<PlaygroundSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
    }
    setLoaded(true);
  }, []);

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
