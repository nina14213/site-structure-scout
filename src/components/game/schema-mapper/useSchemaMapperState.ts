/**
 * @file useSchemaMapperState.ts
 * @description Główny hook stanu Schema Mappera.
 *
 * Zarządza:
 * - Wyborem aktywnego schematu
 * - Mapowaniami kolumn → termów DwC
 * - Konfiguracjami generatora ID
 * - Persystencją w localStorage
 * - Auto-mapowaniem i detekcją nagłówków
 * - Obliczaniem optymalnego układu tabel (greedy set-cover)
 * - Klasyfikacją schematów na optymalne/opcjonalne
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { schemaTerms, schemaTypes } from "./schemaData";
import { findAutoMatches, normalizeHeader, termAliases } from "../AutoMatchDialog";
import { generateAllIds, type IdFieldConfig } from "../IdGeneratorDialog";

/** Wyszukuje najlepiej pasującą kolumnę dla termu DwC — dopasowanie znormalizowane lub alias */
function findBestColumnMatch(term: string, columns: string[], usedColumns?: Set<string>): string | undefined {
  const termNorm = normalizeHeader(term);
  const available = usedColumns ? columns.filter(c => !usedColumns.has(c)) : columns;

  // Tier 1: Exact normalized match
  const exact = available.find(c => normalizeHeader(c) === termNorm);
  if (exact) return exact;

  // Tier 2: Alias match
  const aliases = termAliases[term];
  if (aliases) {
    const aliasMatch = available.find(c => aliases.some(a => normalizeHeader(a) === normalizeHeader(c)));
    if (aliasMatch) return aliasMatch;
  }

  return undefined;
}

/** Sprawdza czy kolumna jest kolumną ID (pozwala na multi-mapowanie) */
export function isMultiMapColumn(colName: string) {
  return /id$/i.test(colName) || /ID/.test(colName);
}

/** Typ elementu optymalnego layoutu */
export interface OptimalLayoutItem {
  schemaId: string;
  terms: string[];
  required: string[];
}

/** Skalsyfikowane schematy (optymalne vs opcjonalne) */
export interface ClassifiedSchemas {
  optimal: string[];
  optional: string[];
}

interface UseSchemaMapperStateProps {
  columns: string[];
  data: any[];
  fileName: string;
  language: string;
}

export function useSchemaMapperState({ columns, data, fileName, language }: UseSchemaMapperStateProps) {
  const storageKey = `dwc-mappings-${fileName}`;
  const autoMatchShown = useRef(false);

  // ─── Persisted state ───────────────────────────────────────────────

  /** Aktualnie wybrany schemat */
  const [selectedSchema, setSelectedSchema] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).schema || "event";
    } catch {}
    return "event";
  });

  /** Mapowania: termDwC → nazwaKolumny */
  const [mappings, setMappings] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.columns && JSON.stringify(parsed.columns.sort()) === JSON.stringify([...columns].sort())) {
          return parsed.mappings || {};
        }
      }
    } catch {}
    return {};
  });

  /** Konfiguracje generatora ID */
  const [generatedIdConfigs, setGeneratedIdConfigs] = useState<IdFieldConfig[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.idConfigs && parsed.columns && JSON.stringify(parsed.columns.sort()) === JSON.stringify([...columns].sort())) {
          return parsed.idConfigs;
        }
      }
    } catch {}
    return [];
  });

  // ─── UI state ──────────────────────────────────────────────────────

  const [searchTerm, setSearchTerm] = useState("");
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [previewSchemaId, setPreviewSchemaId] = useState<string | null>(null);
  const [convertDatesToISO, setConvertDatesToISO] = useState(true);
  const [showAutoMatch, setShowAutoMatch] = useState(false);
  const [autoMatchResults, setAutoMatchResults] = useState<ReturnType<typeof findAutoMatches>>([]);
  const [dismissedSchemas, setDismissedSchemas] = useState<Set<string>>(new Set());
  const [selectedForDownload, setSelectedForDownload] = useState<Set<string>>(new Set());
  const [showIdGenerator, setShowIdGenerator] = useState(false);

  // ─── Persistence ───────────────────────────────────────────────────

  /** Zapisuje mapowania do localStorage */
  const saveMappings = useCallback(
    (newMappings: Record<string, string>, schema?: string) => {
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            mappings: newMappings,
            schema: schema || selectedSchema,
            columns,
            idConfigs: existing.idConfigs || generatedIdConfigs,
          }),
        );
      } catch {}
    },
    [storageKey, selectedSchema, columns, generatedIdConfigs],
  );

  /** Zapisuje konfiguracje ID do localStorage */
  const saveIdConfigs = useCallback((configs: IdFieldConfig[]) => {
    setGeneratedIdConfigs(configs);
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
      localStorage.setItem(storageKey, JSON.stringify({ ...existing, idConfigs: configs }));
    } catch {}
  }, [storageKey]);

  /** Wrapper na setMappings z automatycznym persystowaniem */
  const updateMappings = useCallback(
    (updater: (prev: Record<string, string>) => Record<string, string>) => {
      setMappings((prev) => {
        const next = updater(prev);
        saveMappings(next);
        return next;
      });
    },
    [saveMappings],
  );

  /** Zmiana aktywnego schematu z persystencją */
  const handleSchemaChange = useCallback((schemaId: string) => {
    setSelectedSchema(schemaId);
    saveMappings(mappings, schemaId);
  }, [saveMappings, mappings]);

  // ─── Auto-match ────────────────────────────────────────────────────

  /** Automatyczne wykrywanie dopasowań przy montowaniu */
  useEffect(() => {
    if (autoMatchShown.current) return;
    if (Object.keys(mappings).length > 0) return;
    const matches = findAutoMatches(columns, data, schemaTerms, schemaTypes, language);
    if (matches.length > 0) {
      autoMatchShown.current = true;
      setAutoMatchResults(matches);
    }
  }, [columns, data, language, mappings]);

  /** Ręczne uruchomienie detekcji nagłówków */
  const handleDetectHeaders = useCallback(() => {
    const matches = findAutoMatches(columns, data, schemaTerms, schemaTypes, language);
    setAutoMatchResults(matches);
    if (matches.length > 0) {
      setShowAutoMatch(true);
    }
  }, [columns, data, language]);

  /** Zastosowanie wyników auto-match */
  const handleAutoMatchApply = useCallback((selectedMatches: typeof autoMatchResults) => {
    const newMappings: Record<string, string> = { ...mappings };
    const schemaCounts: Record<string, number> = {};
    selectedMatches.forEach(m => {
      schemaCounts[m.schemaId] = (schemaCounts[m.schemaId] || 0) + 1;
      newMappings[m.termName] = m.column;
    });
    const topSchema = Object.entries(schemaCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSchema) {
      setSelectedSchema(topSchema[0]);
      saveMappings(newMappings, topSchema[0]);
    }
    setMappings(newMappings);
    setShowAutoMatch(false);
  }, [mappings, saveMappings]);

  // ─── Drag & drop / tap-to-assign ──────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, column: string) => {
    e.dataTransfer.setData("text/plain", column);
    setDraggedColumn(column);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, termName: string) => {
    e.preventDefault();
    const columnName = e.dataTransfer.getData("text/plain");
    updateMappings((prev) => {
      const newMappings = { ...prev };
      if (!isMultiMapColumn(columnName)) {
        Object.keys(newMappings).forEach((key) => {
          if (newMappings[key] === columnName) delete newMappings[key];
        });
      }
      newMappings[termName] = columnName;
      return newMappings;
    });
    setDraggedColumn(null);
  }, [updateMappings]);

  const handleRemoveMapping = useCallback((termName: string) => {
    updateMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[termName];
      return newMappings;
    });
  }, [updateMappings]);

  const handleTapSelectColumn = useCallback((column: string) => {
    setSelectedColumn((prev) => (prev === column ? null : column));
  }, []);

  const handleTapAssignTerm = useCallback((termName: string) => {
    if (!selectedColumn) return;
    updateMappings((prev) => {
      const newMappings = { ...prev };
      if (!isMultiMapColumn(selectedColumn)) {
        Object.keys(newMappings).forEach((key) => {
          if (newMappings[key] === selectedColumn) delete newMappings[key];
        });
      }
      newMappings[termName] = selectedColumn;
      return newMappings;
    });
    setSelectedColumn(null);
  }, [selectedColumn, updateMappings]);

  const handleReset = useCallback(() => {
    updateMappings(() => ({}));
  }, [updateMappings]);

  /** Auto-map across ALL schemas (not just current) */
  const handleAutoMap = useCallback(() => {
    const newMappings: Record<string, string> = { ...mappings };
    for (const [, schema] of Object.entries(schemaTerms)) {
      [...schema.required, ...schema.optional].forEach((term) => {
        if (!newMappings[term]) {
          const match = findBestColumnMatch(term, columns);
          if (match) newMappings[term] = match;
        }
      });
    }
    updateMappings(() => newMappings);
  }, [mappings, columns, updateMappings]);

  // ─── Column helpers ────────────────────────────────────────────────

  /** Zwraca pierwsze mapowanie dla kolumny */
  const getColumnMapping = useCallback((columnName: string) => {
    return Object.entries(mappings).find(([, col]) => col === columnName)?.[0] || null;
  }, [mappings]);

  /** Zwraca WSZYSTKIE mapowania dla kolumny (dla ID multi-map) */
  const getAllColumnMappings = useCallback((columnName: string) => {
    return Object.entries(mappings).filter(([, col]) => col === columnName).map(([term]) => term);
  }, [mappings]);

  /** Próbki wartości kolumny (max 3) */
  const getSampleValues = useCallback(
    (columnName: string) => {
      return data.slice(0, 3).map((row) => row[columnName]).filter(Boolean).join(", ");
    },
    [data],
  );

  // ─── Computed values ───────────────────────────────────────────────

  const currentSchema = schemaTerms[selectedSchema];

  /** Wymagane ID-termy niezamapowane — w schematach wybranych (nie-dismissed) z jakimikolwiek mapowaniami */
  const unmappedRequiredIdTerms = useMemo(() => {
    const idTerms = new Set<string>();
    for (const [schemaId, schema] of Object.entries(schemaTerms)) {
      if (dismissedSchemas.has(schemaId)) continue;
      const allTerms = [...schema.required, ...schema.optional];
      const mappedTerms = allTerms.filter(t => mappings[t]);
      if (mappedTerms.length === 0) continue;
      for (const req of schema.required) {
        if (req.toLowerCase().endsWith('id') && !mappings[req]) {
          idTerms.add(req);
        }
      }
    }
    return [...idTerms];
  }, [mappings, dismissedSchemas]);

  /** Wygenerowane wartości ID na cały dataset */
  const generatedIdValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const config of generatedIdConfigs) {
      if (config.mode === 'skip') continue;
      result[config.term] = generateAllIds(config, data);
    }
    return result;
  }, [generatedIdConfigs, data]);

  /** Grupowanie mapowań wg schematu */
  const getMappingsBySchema = useCallback(() => {
    const grouped: Record<string, Record<string, string>> = {};
    Object.entries(mappings).forEach(([term, col]) => {
      for (const [schemaId, schema] of Object.entries(schemaTerms)) {
        if (schema.required.includes(term) || schema.optional.includes(term)) {
          if (!grouped[schemaId]) grouped[schemaId] = {};
          grouped[schemaId][term] = col;
          break;
        }
      }
    });
    return grouped;
  }, [mappings]);

  const groupedMappings = getMappingsBySchema();
  const schemasWithMappings = Object.keys(groupedMappings);

  /** Optymalny układ tabel — algorytm greedy set-cover */
  const optimalLayout = useMemo((): OptimalLayoutItem[] => {
    const mapped = Object.keys(mappings);
    if (mapped.length === 0) return [];

    const schemaForTerm: Record<string, string[]> = {};
    mapped.forEach(term => {
      const schemas: string[] = [];
      for (const [schemaId, schema] of Object.entries(schemaTerms)) {
        if (schema.required.includes(term) || schema.optional.includes(term)) {
          schemas.push(schemaId);
        }
      }
      schemaForTerm[term] = schemas;
    });

    const uncovered = new Set(mapped);
    const chosen: OptimalLayoutItem[] = [];

    while (uncovered.size > 0) {
      let bestSchema = '';
      let bestTerms: string[] = [];
      let bestRequired: string[] = [];
      let bestCount = 0;

      for (const [schemaId, schema] of Object.entries(schemaTerms)) {
        const allSchemaTerms = [...schema.required, ...schema.optional];
        const covered = allSchemaTerms.filter(t => uncovered.has(t));
        if (covered.length > bestCount) {
          bestCount = covered.length;
          bestSchema = schemaId;
          bestTerms = covered;
          bestRequired = schema.required.filter(t => !mappings[t] && !generatedIdConfigs.some(c => c.term === t && c.mode !== 'skip'));
        }
      }

      if (bestCount === 0) break;
      chosen.push({ schemaId: bestSchema, terms: bestTerms, required: bestRequired });
      bestTerms.forEach(t => uncovered.delete(t));
    }

    return chosen;
  }, [mappings, generatedIdConfigs]);

  /** Klasyfikacja schematów na optymalne i opcjonalne */
  const classifiedSchemas = useMemo((): ClassifiedSchemas => {
    const optimalIds = new Set(optimalLayout.map(o => o.schemaId));
    const optimal: string[] = [];
    const optional: string[] = [];

    schemasWithMappings.forEach(schemaId => {
      const fullSchema = schemaTerms[schemaId];
      if (!fullSchema) { optional.push(schemaId); return; }

      // Pomijaj schematy, gdzie jedyne zmapowane pola to pola ID
      const schemaMappedTerms = Object.keys(groupedMappings[schemaId] || {});
      const hasNonIdMapped = schemaMappedTerms.some(t => !t.toLowerCase().endsWith('id'));
      if (!hasNonIdMapped) return;

      const hasReqFields = fullSchema.required.length > 0;
      const allReqMapped = !hasReqFields || fullSchema.required.every(t => mappings[t] || generatedIdConfigs.some(c => c.term === t && c.mode !== 'skip'));
      if (optimalIds.has(schemaId) && allReqMapped) {
        optimal.push(schemaId);
      } else {
        optional.push(schemaId);
      }
    });
    return { optimal, optional };
  }, [optimalLayout, schemasWithMappings, mappings, generatedIdConfigs]);

  const allRequiredMapped = currentSchema.required.every((term) => mappings[term]);
  const selectedSchemaInfo = schemaTypes.find((s) => s.id === selectedSchema);

  return {
    // State
    selectedSchema,
    mappings,
    generatedIdConfigs,
    searchTerm,
    setSearchTerm,
    draggedColumn,
    setDraggedColumn,
    selectedColumn,
    setSelectedColumn,
    previewSchemaId,
    setPreviewSchemaId,
    convertDatesToISO,
    setConvertDatesToISO,
    showAutoMatch,
    setShowAutoMatch,
    autoMatchResults,
    dismissedSchemas,
    setDismissedSchemas,
    selectedForDownload,
    setSelectedForDownload,
    showIdGenerator,
    setShowIdGenerator,

    // Derived
    currentSchema,
    allRequiredMapped,
    selectedSchemaInfo,
    unmappedRequiredIdTerms,
    generatedIdValues,
    groupedMappings,
    schemasWithMappings,
    optimalLayout,
    classifiedSchemas,

    // Actions
    handleSchemaChange,
    handleDetectHeaders,
    handleAutoMatchApply,
    handleDragStart,
    handleDrop,
    handleRemoveMapping,
    handleTapSelectColumn,
    handleTapAssignTerm,
    handleReset,
    handleAutoMap,
    getColumnMapping,
    getAllColumnMappings,
    getSampleValues,
    saveMappings,
    saveIdConfigs,
    updateMappings,
    getMappingsBySchema,

    // Helpers
    findBestColumnMatch: (term: string) => findBestColumnMatch(term, columns),
    storageKey,
  };
}
