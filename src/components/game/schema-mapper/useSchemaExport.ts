/**
 * @file useSchemaExport.ts
 * @description Hook obsługujący eksport danych — generowanie CSV, pobieranie plików i ZIP.
 *
 * Zawiera:
 * - Konwersję dat do formatu ISO 8601
 * - Generowanie podglądu wierszy (preview)
 * - Generowanie pełnego CSV z wygenerowanymi ID i konwertowanymi datami
 * - Pobieranie pojedynczych plików CSV
 * - Pobieranie archiwów ZIP (wszystkie / optymalne / opcjonalne / wybrane)
 */

import { useCallback } from "react";
import JSZip from "jszip";
import { schemaTerms } from "./schemaData";
import type { IdFieldConfig } from "../IdGeneratorDialog";

/** Sprawdza czy term jest termem daty (wyklucza verbatim*) */
export function isDateTerm(term: string) {
  if (/^verbatim/i.test(term)) return false;
  return /date|Date|day|Day|eventDate|dateIdentified|georeferencedDate|CreateDate|agentRoleDate/.test(term);
}

/** Konwertuje numer seryjny Excela na datę ISO */
function excelDateToISO(serial: number): string {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const msPerDay = 86400000;
  const date = new Date(excelEpoch.getTime() + serial * msPerDay);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  if (hours === 0 && minutes === 0) return dateStr;
  return `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Normalizuje dowolny format daty do ISO 8601 */
function normalizeDate(value: string): string {
  if (!value || value.trim() === "") return value;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(trimmed)) return trimmed;

  const asNum = Number(trimmed);
  if (!isNaN(asNum) && asNum > 1000 && asNum < 200000 && /^\d+(\.\d+)?$/.test(trimmed)) {
    return excelDateToISO(asNum);
  }

  const dmy = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const ymd = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return trimmed;
}

interface UseSchemaExportProps {
  data: any[];
  fileName: string;
  convertDatesToISO: boolean;
  generatedIdConfigs: IdFieldConfig[];
  generatedIdValues: Record<string, string[]>;
  getMappingsBySchema: () => Record<string, Record<string, string>>;
  classifiedSchemas: { optimal: string[]; optional: string[] };
  selectedForDownload: Set<string>;
  extraColumnsPerSchema: Record<string, string[]>;
}

export function useSchemaExport({
  data,
  fileName,
  convertDatesToISO,
  generatedIdConfigs,
  generatedIdValues,
  getMappingsBySchema,
  classifiedSchemas,
  selectedForDownload,
  extraColumnsPerSchema,
}: UseSchemaExportProps) {

  /** Warunkowa konwersja daty na ISO */
  const maybeConvertDate = useCallback(
    (value: string, term: string): string => {
      if (!convertDatesToISO) return value;
      if (!isDateTerm(term)) return value;
      return normalizeDate(value);
    },
    [convertDatesToISO],
  );

  /** Znajduje termy ID wygenerowane, pasujące do danego schematu */
  const getGenTermsForSchema = useCallback(
    (dwcHeaders: string[]) => {
      return generatedIdConfigs
        .filter(c => c.mode !== 'skip' && !dwcHeaders.includes(c.term))
        .filter(c => {
          for (const [, schema] of Object.entries(schemaTerms)) {
            if ((schema.required.includes(c.term) || schema.optional.includes(c.term)) &&
                dwcHeaders.some(h => schema.required.includes(h) || schema.optional.includes(h))) {
              return true;
            }
          }
          return false;
        });
    },
    [generatedIdConfigs],
  );

  /** Generuje wiersze podglądu (pierwsze 5 + ostatnie 5) dla danego zestawu mapowań */
  const getPreviewRows = useCallback(
    (termMappings: Record<string, string>) => {
      const dwcHeaders = Object.keys(termMappings);
      const genTerms = getGenTermsForSchema(dwcHeaders);

      const buildRow = (row: any, rowIdx: number) => {
        const previewRow: Record<string, string> = {};
        genTerms.forEach(config => {
          const vals = generatedIdValues[config.term];
          previewRow[config.term] = vals?.[rowIdx] ?? '';
        });
        dwcHeaders.forEach((term) => {
          const sourceCol = termMappings[term];
          let rawValue: string;
          // Handle pipe-joined multi-column mappings
          if (sourceCol && sourceCol.includes(' | ')) {
            const cols = sourceCol.split(' | ');
            rawValue = cols.map(c => String(row[c] ?? '')).filter(v => v.trim() !== '').join(' | ');
            // Add legend column with source column names
            previewRow[`${term}_legenda`] = cols.join(' | ');
          } else {
            rawValue = String(row[sourceCol] ?? "");
          }
          previewRow[term] = rawValue;
          if (convertDatesToISO && isDateTerm(term)) {
            const converted = maybeConvertDate(rawValue, term);
            if (converted !== rawValue && rawValue.trim() !== "") {
              previewRow[`${term}_ISO`] = converted;
            }
          }
        });
        return previewRow;
      };

      // Filter rows that have at least one non-empty mapped value
      const mappedCols = Object.values(termMappings);
      const rowHasData = (row: any) =>
        mappedCols.some(colSpec => {
          // Handle pipe-joined multi-column specs
          const cols = colSpec.includes(' | ') ? colSpec.split(' | ') : [colSpec];
          return cols.some(col => {
            const v = row[col];
            return v !== undefined && v !== null && String(v).trim() !== '';
          });
        });

      const dataWithIndex = data.map((row, i) => ({ row, idx: i }));
      const nonEmptyRows = dataWithIndex.filter(r => rowHasData(r.row));

      if (nonEmptyRows.length <= 10) {
        return nonEmptyRows.map(r => buildRow(r.row, r.idx));
      }

      const firstRows = nonEmptyRows.slice(0, 5).map(r => buildRow(r.row, r.idx));
      const lastRows = nonEmptyRows.slice(-5).map(r => buildRow(r.row, r.idx));
      return [...firstRows, { __separator: true } as any, ...lastRows];
    },
    [data, maybeConvertDate, convertDatesToISO, generatedIdValues, getGenTermsForSchema],
  );

  /** Generuje pełną treść CSV dla zestawu mapowań — nagłówki obejmują WSZYSTKIE termy schematu */
  const generateCSV = useCallback(
    (termMappings: Record<string, string>, schemaId?: string) => {
      const dwcHeaders = Object.keys(termMappings);
      const genTerms = getGenTermsForSchema(dwcHeaders);

      // Pełna lista termów schematu (wymagane + opcjonalne), nie tylko zmapowane
      let allSchemaTerms: string[] = dwcHeaders;
      if (schemaId && schemaTerms[schemaId]) {
        const schema = schemaTerms[schemaId];
        allSchemaTerms = [...schema.required, ...schema.optional];
      }

      const csvHeaders: string[] = [];
      genTerms.forEach(c => csvHeaders.push(c.term));
      allSchemaTerms.forEach((term) => {
        if (!csvHeaders.includes(term)) {
          csvHeaders.push(term);
        }
        // Add legend column for multi-mapped terms
        if (termMappings[term] && termMappings[term].includes(' | ')) {
          csvHeaders.push(`${term}_legenda`);
        }
        if (convertDatesToISO && isDateTerm(term) && termMappings[term]) {
          csvHeaders.push(`${term}_ISO`);
        }
      });

      const csvRows: string[] = [csvHeaders.join(",")];
      const escape = (v: string) => {
        if (v.includes(",") || v.includes('"') || v.includes("\n")) {
          return `"${v.replace(/"/g, '""')}"`;
        }
        return v;
      };

      data.forEach((row, rowIdx) => {
        const rowValues: string[] = [];
        genTerms.forEach(config => {
          const vals = generatedIdValues[config.term];
          rowValues.push(escape(vals?.[rowIdx] ?? ''));
        });
        allSchemaTerms.forEach((term) => {
          if (genTerms.some(c => c.term === term)) return; // already added as generated
          const sourceColumn = termMappings[term];
          let rawValue: string;
          // Handle pipe-joined multi-column mappings
          if (sourceColumn && sourceColumn.includes(' | ')) {
            const cols = sourceColumn.split(' | ');
            rawValue = cols.map(c => String(row[c] ?? '')).filter(v => v.trim() !== '').join(' | ');
          } else {
            rawValue = sourceColumn ? String(row[sourceColumn] ?? "") : "";
          }
          rowValues.push(escape(rawValue));
          // Add legend value for multi-mapped terms
          if (sourceColumn && sourceColumn.includes(' | ')) {
            const cols = sourceColumn.split(' | ');
            rowValues.push(escape(cols.join(' | ')));
          }
          if (convertDatesToISO && isDateTerm(term) && termMappings[term]) {
            const converted = maybeConvertDate(rawValue, term);
            rowValues.push(escape(converted));
          }
        });
        csvRows.push(rowValues.join(","));
      });

      return "\uFEFF" + csvRows.join("\n");
    },
    [data, maybeConvertDate, convertDatesToISO, generatedIdValues, getGenTermsForSchema],
  );

  // ─── Download helpers ──────────────────────────────────────────────

  const downloadFile = useCallback((content: string, name: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const downloadZip = useCallback(async (files: { name: string; content: string }[], zipName: string) => {
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const baseName = fileName.replace(/\.[^/.]+$/, "");

  /** Pobierz wszystkie zmapowane schematy jako ZIP */
  const handleDownloadAll = useCallback(() => {
    const grouped = getMappingsBySchema();
    const files = Object.entries(grouped).map(([schemaId, termMappings]) => ({
      name: `${schemaId}_${baseName}.csv`,
      content: generateCSV(termMappings, schemaId),
    }));
    downloadZip(files, `${baseName}_dwc-dp.zip`);
  }, [getMappingsBySchema, generateCSV, downloadZip, baseName]);

  /** Pobierz pojedynczy schemat jako CSV */
  const handleDownloadSchema = useCallback(
    (schemaId: string) => {
      const grouped = getMappingsBySchema();
      const termMappings = grouped[schemaId];
      if (!termMappings) return;
      downloadFile(generateCSV(termMappings, schemaId), `${schemaId}_${baseName}.csv`);
    },
    [getMappingsBySchema, generateCSV, downloadFile, baseName],
  );

  /** Pobierz filtrowane schematy (optymalne lub opcjonalne) */
  const handleDownloadFiltered = useCallback((filter: 'optimal' | 'optional') => {
    const grouped = getMappingsBySchema();
    const ids = filter === 'optimal' ? classifiedSchemas.optimal : classifiedSchemas.optional;
    const files = ids
      .map(schemaId => {
        const termMappings = grouped[schemaId];
        if (!termMappings) return null;
        return { name: `${schemaId}_${baseName}.csv`, content: generateCSV(termMappings, schemaId) };
      })
      .filter(Boolean) as { name: string; content: string }[];
    downloadZip(files, `${baseName}_${filter}.zip`);
  }, [getMappingsBySchema, classifiedSchemas, generateCSV, downloadZip, baseName]);

  /** Pobierz ręcznie wybrane schematy jako ZIP */
  const handleDownloadSelected = useCallback(() => {
    if (selectedForDownload.size === 0) return;
    const grouped = getMappingsBySchema();
    const files = [...selectedForDownload]
      .map(schemaId => {
        const termMappings = grouped[schemaId];
        if (!termMappings) return null;
        return { name: `${schemaId}_${baseName}.csv`, content: generateCSV(termMappings, schemaId) };
      })
      .filter(Boolean) as { name: string; content: string }[];
    downloadZip(files, `${baseName}_selected.zip`);
  }, [selectedForDownload, getMappingsBySchema, generateCSV, downloadZip, baseName]);

  return {
    maybeConvertDate,
    isDateTerm,
    getPreviewRows,
    generateCSV,
    handleDownloadAll,
    handleDownloadSchema,
    handleDownloadFiltered,
    handleDownloadSelected,
  };
}
