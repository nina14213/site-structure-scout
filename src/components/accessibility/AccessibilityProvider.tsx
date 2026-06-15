import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import {
  AccessibilityContext,
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type AccessibilityContextType,
  type AccessibilitySettings,
  useAccessibility,
} from "./AccessibilityContext";

function readStoredSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      contrast: parsed.contrast ?? (parsed.highContrast ? "maximum" : DEFAULT_SETTINGS.contrast),
      textScale: parsed.textScale ?? (parsed.largeText ? 112 : DEFAULT_SETTINGS.textScale),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(readStoredSettings);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const textScale = Math.min(150, Math.max(100, settings.textScale));

    root.classList.toggle("wcag-contrast-enhanced", settings.contrast === "enhanced");
    root.classList.toggle("wcag-contrast-maximum", settings.contrast === "maximum");
    root.classList.toggle("wcag-high-contrast", settings.contrast === "maximum");
    root.classList.toggle("wcag-custom-text", textScale !== 100);
    root.classList.toggle("wcag-reduced-motion", settings.reduceMotion);
    root.style.setProperty("--wcag-text-scale", `${textScale / 100}`);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage can be unavailable in restricted browser modes.
    }
  }, [settings]);

  const setSetting = useCallback<AccessibilityContextType["setSetting"]>((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 20);
  }, []);

  const value = useMemo(
    () => ({ settings, setSetting, resetSettings, announce }),
    [settings, setSetting, resetSettings, announce],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div id="a11y-status" className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function AccessibilityMotionConfig({ children }: { children: ReactNode }) {
  const { settings } = useAccessibility();

  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
