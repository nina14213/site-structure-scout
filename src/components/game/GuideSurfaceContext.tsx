import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type GuideSurfaceKey =
  | 'default'
  | 'tutorial'
  | 'coreDataChoice'
  | 'coreDataImport'
  | 'extensionEscapeRoom'
  | 'schemaMapperImportTutorial'
  | 'schemaMapperTutorial'
  | 'schemaMapperAutoMatch'
  | 'schemaMapperSuggest'
  | 'schemaMapperIdGenerator';

export interface GuideSurface {
  key: GuideSurfaceKey;
  levelNumber?: number;
  phase?: number;
}

interface GuideSurfaceEntry {
  id: number;
  surface: GuideSurface;
}

interface GuideSurfaceContextValue {
  activeSurface: GuideSurface;
  registerSurface: (id: number, surface: GuideSurface) => void;
  unregisterSurface: (id: number) => void;
}

const DEFAULT_SURFACE: GuideSurface = { key: 'default' };
const GuideSurfaceContext = createContext<GuideSurfaceContextValue | undefined>(undefined);

export function GuideSurfaceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<GuideSurfaceEntry[]>([]);

  const registerSurface = useCallback((id: number, surface: GuideSurface) => {
    setEntries((previous) => {
      const next = previous.filter((entry) => entry.id !== id);
      return [...next, { id, surface }];
    });
  }, []);

  const unregisterSurface = useCallback((id: number) => {
    setEntries((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  const value = useMemo<GuideSurfaceContextValue>(() => ({
    activeSurface: entries[entries.length - 1]?.surface ?? DEFAULT_SURFACE,
    registerSurface,
    unregisterSurface,
  }), [entries, registerSurface, unregisterSurface]);

  return (
    <GuideSurfaceContext.Provider value={value}>
      {children}
    </GuideSurfaceContext.Provider>
  );
}

export function useGuideSurface() {
  const context = useContext(GuideSurfaceContext);
  if (!context) {
    return {
      activeSurface: DEFAULT_SURFACE,
      registerSurface: () => undefined,
      unregisterSurface: () => undefined,
    };
  }

  return context;
}

// PL: Komponenty z modalami rejestruja aktywna powierzchnie bez przekazywania propsow przez cale drzewo.
// EN: Components with modals register the active surface without prop-drilling through the tree.
export function useGuideSurfaceState(surface: GuideSurface, active: boolean) {
  const { registerSurface, unregisterSurface } = useGuideSurface();
  const idRef = useRef<number | undefined>(undefined);
  const { key, levelNumber, phase } = surface;

  if (idRef.current === undefined) {
    idRef.current = Math.random();
  }

  useEffect(() => {
    const id = idRef.current;
    if (id === undefined || !active) return;

    registerSurface(id, { key, levelNumber, phase });

    return () => unregisterSurface(id);
  }, [active, key, levelNumber, phase, registerSurface, unregisterSurface]);
}
