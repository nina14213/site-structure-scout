import { createContext, useContext } from "react";

export type AccessibilitySettings = {
  contrast: "normal" | "enhanced" | "maximum";
  textScale: number;
  reduceMotion: boolean;
};

export type AccessibilityContextType = {
  settings: AccessibilitySettings;
  setSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  announce: (message: string) => void;
};

export const STORAGE_KEY = "dwc-data-quest-accessibility";

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  contrast: "normal",
  textScale: 100,
  reduceMotion: false,
};

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used inside AccessibilityProvider");
  }
  return context;
}
