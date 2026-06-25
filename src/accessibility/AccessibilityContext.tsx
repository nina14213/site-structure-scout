import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AccessibilitySettings = {
  fontScale: number;
  grayscale: boolean;
  underlineInteractive: boolean;
};

type AccessibilityContextType = AccessibilitySettings & {
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  toggleGrayscale: () => void;
  toggleUnderlineInteractive: () => void;
};

const STORAGE_KEY = "dwc-a11y-settings";
const FONT_STEP = 0.1;
const MIN_FONT_SCALE = 0.9;
const MAX_FONT_SCALE = 1.4;

const defaultSettings: AccessibilitySettings = {
  fontScale: 1,
  grayscale: false,
  underlineInteractive: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

function clampScale(value: number): number {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, Number(value.toFixed(2))));
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
      return {
        fontScale: clampScale(parsed.fontScale ?? 1),
        grayscale: Boolean(parsed.grayscale),
        underlineInteractive: Boolean(parsed.underlineInteractive),
      };
    } catch {
      return defaultSettings;
    }
  });

  const increaseFont = useCallback(() => {
    setSettings((prev) => ({ ...prev, fontScale: clampScale(prev.fontScale + FONT_STEP) }));
  }, []);

  const decreaseFont = useCallback(() => {
    setSettings((prev) => ({ ...prev, fontScale: clampScale(prev.fontScale - FONT_STEP) }));
  }, []);

  const resetFont = useCallback(() => {
    setSettings((prev) => ({ ...prev, fontScale: 1 }));
  }, []);

  const toggleGrayscale = useCallback(() => {
    setSettings((prev) => ({ ...prev, grayscale: !prev.grayscale }));
  }, []);

  const toggleUnderlineInteractive = useCallback(() => {
    setSettings((prev) => ({ ...prev, underlineInteractive: !prev.underlineInteractive }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      void err;
    }
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontScale * 100}%`;
    root.classList.toggle("a11y-grayscale", settings.grayscale);
    root.classList.toggle("a11y-underline-interactive", settings.underlineInteractive);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        root.classList.add("a11y-keyboard-nav");
      }

      if (event.key === "Control") {
        root.classList.add("a11y-ctrl-highlight");
      }

      if (!(event.ctrlKey && event.shiftKey)) return;

      switch (event.code) {
        case "Equal":
        case "NumpadAdd":
          event.preventDefault();
          increaseFont();
          break;
        case "Minus":
        case "NumpadSubtract":
          event.preventDefault();
          decreaseFont();
          break;
        case "Digit0":
        case "Numpad0":
          event.preventDefault();
          resetFont();
          break;
        case "KeyG":
          event.preventDefault();
          toggleGrayscale();
          break;
        case "KeyU":
          event.preventDefault();
          toggleUnderlineInteractive();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        root.classList.remove("a11y-ctrl-highlight");
      }
    };

    const disableKeyboardNav = () => {
      root.classList.remove("a11y-keyboard-nav");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", disableKeyboardNav);
    window.addEventListener("touchstart", disableKeyboardNav, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", disableKeyboardNav);
      window.removeEventListener("touchstart", disableKeyboardNav);
    };
  }, [decreaseFont, increaseFont, resetFont, toggleGrayscale, toggleUnderlineInteractive]);

  const value = useMemo<AccessibilityContextType>(
    () => ({
      fontScale: settings.fontScale,
      grayscale: settings.grayscale,
      underlineInteractive: settings.underlineInteractive,
      increaseFont,
      decreaseFont,
      resetFont,
      toggleGrayscale,
      toggleUnderlineInteractive,
    }),
    [settings, increaseFont, decreaseFont, resetFont, toggleGrayscale, toggleUnderlineInteractive]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}

