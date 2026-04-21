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
import { normalizeDate } from "./useSchemaExport";
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
  const [forcedSchemas, setForcedSchemas] = useState<Set<string>>(new Set());
  const [extraColumnsPerSchema, setExtraColumnsPerSchema] = useState<Record<string, string[]>>({});

  // Default values for missing cells, keyed by source column name.
  // For per-row overrides we use a special key syntax: `${column}::row::${rowIdx}`.
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.defaultValues) return parsed.defaultValues;
      }
    } catch {}
    return {};
  });

  const persistDefaultValues = useCallback((next: Record<string, string>) => {
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
      localStorage.setItem(storageKey, JSON.stringify({ ...existing, defaultValues: next }));
    } catch {}
  }, [storageKey]);

  /** Set a single default value for a source column (bulk fill). Empty → remove. */
  const setColumnDefault = useCallback((column: string, value: string) => {
    setDefaultValues(prev => {
      const next = { ...prev };
      if (value === '' || value == null) delete next[column];
      else next[column] = value;
      persistDefaultValues(next);
      return next;
    });
  }, [persistDefaultValues]);

  /** Set a per-row override for a specific empty cell. */
  const setRowDefault = useCallback((column: string, rowIdx: number, value: string) => {
    const key = `${column}::row::${rowIdx}`;
    setDefaultValues(prev => {
      const next = { ...prev };
      if (value === '' || value == null) delete next[key];
      else next[key] = value;
      persistDefaultValues(next);
      return next;
    });
  }, [persistDefaultValues]);

  /** Clear all defaults (bulk + per-row) for a column. */
  const clearColumnDefaults = useCallback((column: string) => {
    setDefaultValues(prev => {
      const next: Record<string, string> = {};
      const rowPrefix = `${column}::row::`;
      Object.entries(prev).forEach(([k, v]) => {
        if (k === column) return;
        if (k.startsWith(rowPrefix)) return;
        next[k] = v;
      });
      persistDefaultValues(next);
      return next;
    });
  }, [persistDefaultValues]);

  // ─── Undo history ──────────────────────────────────────────────────
  const [mappingsHistory, setMappingsHistory] = useState<Record<string, string>[]>([]);

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

  /** Wrapper na setMappings z automatycznym persystowaniem i historią undo */
  const updateMappings = useCallback(
    (updater: (prev: Record<string, string>) => Record<string, string>) => {
      setMappings((prev) => {
        // Push previous state to undo history (max 30)
        setMappingsHistory(h => [...h.slice(-29), prev]);
        const next = updater(prev);
        saveMappings(next);
        return next;
      });
    },
    [saveMappings],
  );

  /** Cofnij ostatnią zmianę mapowania */
  const handleUndo = useCallback(() => {
    setMappingsHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setMappings(prev);
      saveMappings(prev);
      return h.slice(0, -1);
    });
  }, [saveMappings]);

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
    const matches = findAutoMatches(columns, data, schemaTerms, schemaTypes, language, true);
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
      // If the term already has a mapping, append the column (multi-column / pipe join)
      if (newMappings[termName]) {
        const existing = newMappings[termName].split(' | ');
        if (!existing.includes(columnName)) {
          newMappings[termName] = [...existing, columnName].join(' | ');
        }
      } else {
        if (!isMultiMapColumn(columnName)) {
          Object.keys(newMappings).forEach((key) => {
            if (newMappings[key] === columnName) delete newMappings[key];
          });
        }
        newMappings[termName] = columnName;
      }
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
      // If the term already has a mapping, append (multi-column / pipe join)
      if (newMappings[termName]) {
        const existing = newMappings[termName].split(' | ');
        if (!existing.includes(selectedColumn)) {
          newMappings[termName] = [...existing, selectedColumn].join(' | ');
        }
      } else {
        if (!isMultiMapColumn(selectedColumn)) {
          Object.keys(newMappings).forEach((key) => {
            if (newMappings[key] === selectedColumn) delete newMappings[key];
          });
        }
        newMappings[termName] = selectedColumn;
      }
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

  /** Sprawdza czy kolumna jest częścią mapowania (dokładne lub pipe-join) */
  const colMatchesMappingValue = useCallback((mappingValue: string, columnName: string) => {
    if (mappingValue === columnName) return true;
    if (mappingValue.includes(' | ')) {
      return mappingValue.split(' | ').includes(columnName);
    }
    return false;
  }, []);

  /** Zwraca pierwsze mapowanie dla kolumny */
  const getColumnMapping = useCallback((columnName: string) => {
    return Object.entries(mappings).find(([, col]) => colMatchesMappingValue(col, columnName))?.[0] || null;
  }, [mappings, colMatchesMappingValue]);

  /** Zwraca WSZYSTKIE mapowania dla kolumny (dla ID multi-map i pipe-join) */
  const getAllColumnMappings = useCallback((columnName: string) => {
    return Object.entries(mappings).filter(([, col]) => colMatchesMappingValue(col, columnName)).map(([term]) => term);
  }, [mappings, colMatchesMappingValue]);

  /** Próbki wartości kolumny (max 3) */
  const getSampleValues = useCallback(
    (columnName: string) => {
      return data.slice(0, 3).map((row) => row[columnName]).filter(Boolean).join(", ");
    },
    [data],
  );

  // ─── Computed values ───────────────────────────────────────────────

  const currentSchema = schemaTerms[selectedSchema];

  /** Wszystkie wymagane ID-termy z kwalifikujących się schematów (zmapowane lub nie) */
  const allRequiredIdTerms = useMemo(() => {
    const idTerms = new Set<string>();
    for (const [schemaId, schema] of Object.entries(schemaTerms)) {
      if (dismissedSchemas.has(schemaId)) continue;
      const allTerms = [...schema.required, ...schema.optional];
      const mappedTerms = allTerms.filter(t => mappings[t]);
      if (mappedTerms.length === 0) continue;
      const hasNonIdMapped = mappedTerms.some(t => !t.toLowerCase().endsWith('id'));
      if (!hasNonIdMapped && !forcedSchemas.has(schemaId)) continue;
      for (const req of schema.required) {
        if (req.toLowerCase().endsWith('id')) {
          idTerms.add(req);
        }
      }
    }
    return [...idTerms];
  }, [mappings, dismissedSchemas, forcedSchemas]);

  /** Wymagane ID-termy niezamapowane (bez konfiguracji generatora i bez mapowania) */
  const unmappedRequiredIdTerms = useMemo(() => {
    const configuredTerms = new Set(generatedIdConfigs.map(c => c.term));
    return allRequiredIdTerms.filter(t => !mappings[t] && !configuredTerms.has(t));
  }, [allRequiredIdTerms, mappings, generatedIdConfigs]);

  /** Detect non-ISO dates in eventDate mapping */
  const eventDateIsoSuggestion = useMemo(() => {
    const eventDateCol = mappings['eventDate'];
    if (!eventDateCol) return null;
    if (mappings['verbatimEventDate'] === eventDateCol) return null;

    const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;
    const cols = eventDateCol.includes(' | ') ? eventDateCol.split(' | ') : [eventDateCol];

    // Collect all non-empty rows with their values
    const allRows: { idx: number; original: string; converted: string; wasConverted: boolean }[] = [];
    let nonIsoCount = 0;

    for (let i = 0; i < data.length; i++) {
      const val = String(cols.map(c => data[i]?.[c] ?? '').join('')).trim();
      if (!val) continue;
      const converted = normalizeDate(val);
      const isIso = isoRegex.test(val);
      if (!isIso) nonIsoCount++;
      allRows.push({ idx: i + 1, original: val, converted, wasConverted: !isIso && converted !== val });
    }

    if (allRows.length === 0 || nonIsoCount === 0) return null;

    // Build first 5 + last 5 preview
    let samples: typeof allRows;
    if (allRows.length <= 10) {
      samples = allRows;
    } else {
      samples = [
        ...allRows.slice(0, 5),
        { idx: -1, original: '', converted: '', wasConverted: false }, // separator
        ...allRows.slice(-5),
      ];
    }

    return { column: eventDateCol, nonIsoCount, totalNonEmpty: allRows.length, samples };
  }, [mappings, data]);

  /** Apply suggestion: copy eventDate → verbatimEventDate */
  const applyEventDateIsoSuggestion = useCallback(() => {
    const eventDateCol = mappings['eventDate'];
    if (!eventDateCol) return;
    updateMappings(prev => ({
      ...prev,
      verbatimEventDate: eventDateCol,
    }));
    setConvertDatesToISO(true);
  }, [mappings, updateMappings]);

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

      // Pomijaj schematy, gdzie jedyne zmapowane pola to pola ID (chyba że wymuszone)
      const schemaMappedTerms = Object.keys(groupedMappings[schemaId] || {});
      const hasNonIdMapped = schemaMappedTerms.some(t => !t.toLowerCase().endsWith('id'));
      if (!hasNonIdMapped && !forcedSchemas.has(schemaId)) return;

      // Wymuszone schematy (📌) zawsze trafiają do optymalnych
      if (forcedSchemas.has(schemaId)) {
        optimal.push(schemaId);
        return;
      }

      const hasReqFields = fullSchema.required.length > 0;
      const allReqMapped = !hasReqFields || fullSchema.required.every(t => mappings[t] || generatedIdConfigs.some(c => c.term === t && c.mode !== 'skip'));
      if (optimalIds.has(schemaId) && allReqMapped) {
        optimal.push(schemaId);
      } else {
        optional.push(schemaId);
      }
    });
    return { optimal, optional };
  }, [optimalLayout, schemasWithMappings, mappings, generatedIdConfigs, forcedSchemas]);

  const toggleForcedSchema = useCallback((schemaId: string) => {
    setForcedSchemas(prev => {
      const next = new Set(prev);
      if (next.has(schemaId)) next.delete(schemaId);
      else next.add(schemaId);
      return next;
    });
  }, []);

  const allRequiredMapped = currentSchema.required.every((term) => mappings[term]);
  const selectedSchemaInfo = schemaTypes.find((s) => s.id === selectedSchema);

  /** Columns from original file that are NOT mapped to any DwC term */
  const unmappedColumns = useMemo(() => {
    const mappedCols = new Set<string>();
    Object.values(mappings).forEach(val => {
      if (val.includes(' | ')) {
        val.split(' | ').forEach(c => mappedCols.add(c));
      } else {
        mappedCols.add(val);
      }
    });
    return columns.filter(c => !mappedCols.has(c));
  }, [columns, mappings]);

  /** Toggle an extra (unmapped) column for a schema */
  const toggleExtraColumn = useCallback((schemaId: string, column: string) => {
    setExtraColumnsPerSchema(prev => {
      const existing = prev[schemaId] || [];
      const has = existing.includes(column);
      return {
        ...prev,
        [schemaId]: has ? existing.filter(c => c !== column) : [...existing, column],
      };
    });
  }, []);

  /** Select/deselect all unmapped columns for a schema */
  const selectAllExtraColumns = useCallback((schemaId: string) => {
    setExtraColumnsPerSchema(prev => {
      const existing = prev[schemaId] || [];
      // If all are selected, deselect all; otherwise select all
      const allSelected = unmappedColumns.length > 0 && existing.length === unmappedColumns.length;
      return {
        ...prev,
        [schemaId]: allSelected ? [] : [...unmappedColumns],
      };
    });
  }, [unmappedColumns]);

  /** Inteligentne sugestie — kolumny pasujące do termów DwC ale jeszcze nie zmapowane */
  const columnSuggestions = useMemo(() => {
    const suggestions: Record<string, string> = {};
    for (const col of columns) {
      if (getColumnMapping(col)) continue; // already mapped
      // Check all schemas for a matching term
      for (const [, schema] of Object.entries(schemaTerms)) {
        const allTerms = [...schema.required, ...schema.optional];
        for (const term of allTerms) {
          if (mappings[term]) continue; // term already mapped
          const termNorm = normalizeHeader(term);
          const colNorm = normalizeHeader(col);
          if (termNorm === colNorm) {
            suggestions[col] = term;
            break;
          }
          const aliases = termAliases[term];
          if (aliases?.some(a => normalizeHeader(a) === colNorm)) {
            suggestions[col] = term;
            break;
          }
        }
        if (suggestions[col]) break;
      }
    }
    return suggestions;
  }, [columns, mappings, getColumnMapping]);

  // ─── Missing values analysis ─────────────────────────────────────
  /** For each column that's mapped to a DwC term, list empty rows + top values */
  const missingByColumn = useMemo(() => {
    const mappedSourceCols = new Set<string>();
    Object.values(mappings).forEach(val => {
      if (val.includes(' | ')) val.split(' | ').forEach(c => mappedSourceCols.add(c));
      else mappedSourceCols.add(val);
    });

    const result: Record<string, {
      column: string;
      missingIndices: number[];
      totalRows: number;
      topValues: { value: string; count: number }[];
      mappedTerms: string[];
    }> = {};

    mappedSourceCols.forEach(col => {
      const missing: number[] = [];
      const counts: Record<string, number> = {};
      data.forEach((row, i) => {
        const v = row?.[col];
        if (v === undefined || v === null || String(v).trim() === '') {
          missing.push(i);
        } else {
          const s = String(v).trim();
          counts[s] = (counts[s] || 0) + 1;
        }
      });
      if (missing.length === 0) return;
      const topValues = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([value, count]) => ({ value, count }));
      const mappedTerms = Object.entries(mappings)
        .filter(([, v]) => v === col || (v.includes(' | ') && v.split(' | ').includes(col)))
        .map(([t]) => t);
      result[col] = {
        column: col,
        missingIndices: missing,
        totalRows: data.length,
        topValues,
        mappedTerms,
      };
    });

    return result;
  }, [mappings, data]);

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
    forcedSchemas,
    toggleForcedSchema,
    extraColumnsPerSchema,
    setExtraColumnsPerSchema,
    mappingsHistory,

    // Derived
    currentSchema,
    allRequiredMapped,
    selectedSchemaInfo,
     unmappedRequiredIdTerms,
     allRequiredIdTerms,
    generatedIdValues,
    eventDateIsoSuggestion,
    groupedMappings,
    schemasWithMappings,
    optimalLayout,
    classifiedSchemas,
    unmappedColumns,
    columnSuggestions,
    missingByColumn,
    defaultValues,

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
    handleUndo,
    getColumnMapping,
    getAllColumnMappings,
    getSampleValues,
    saveMappings,
    saveIdConfigs,
    updateMappings,
    applyEventDateIsoSuggestion,
    getMappingsBySchema,
    toggleExtraColumn,
    selectAllExtraColumns,
    setColumnDefault,
    setRowDefault,
    clearColumnDefaults,

    // Helpers
    findBestColumnMatch: (term: string) => findBestColumnMatch(term, columns),
    storageKey,
  };
}
