/**
 * @file MissingValuesPanel.tsx
 * @description Panel uzupełniania pustych komórek w zmapowanych kolumnach źródłowych.
 *
 * Dwa widoki:
 *  - "cards"  — karta na kolumnę: bulk fill + per-row edit + sugestie (top values + DwC vocab)
 *  - "table"  — pojedyncza tabela WSZYSTKICH braków z filtrowaniem (kolumna, status, fraza)
 *
 * Sugestie: top-3 najczęstsze + kontrolowane słowniki DwC (gdy kolumna jest zmapowana
 * do termu z `allowedValues`).
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronDown, ChevronUp, AlertTriangle, Wand2, RotateCcw, CheckCircle2,
  ListChecks, BookMarked, Table as TableIcon, LayoutGrid, Search, Filter, X,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { dwcTerms } from "../DwCTerms";

interface MissingInfo {
  column: string;
  missingIndices: number[];
  totalRows: number;
  topValues: { value: string; count: number }[];
  mappedTerms: string[];
}

interface MissingValuesPanelProps {
  missingByColumn: Record<string, MissingInfo>;
  data: any[];
  defaultValues: Record<string, string>;
  setColumnDefault: (column: string, value: string) => void;
  setRowDefault: (column: string, rowIdx: number, value: string) => void;
  clearColumnDefaults: (column: string) => void;
}

type ViewMode = "cards" | "table";
type StatusFilter = "all" | "filled" | "empty";

export default function MissingValuesPanel({
  missingByColumn,
  data,
  defaultValues,
  setColumnDefault,
  setRowDefault,
  clearColumnDefaults,
}: MissingValuesPanelProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<ViewMode>("table");
  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [modePerCol, setModePerCol] = useState<Record<string, "bulk" | "rows">>({});
  const [bulkDrafts, setBulkDrafts] = useState<Record<string, string>>({});

  // Table filters
  const [colFilter, setColFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const entries = useMemo(() => Object.values(missingByColumn), [missingByColumn]);

  // Vocabulary per column (memoized once)
  const vocabByColumn = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const info of entries) {
      const vocab = new Set<string>();
      info.mappedTerms.forEach((term) => {
        const def = dwcTerms[term];
        if (def?.allowedValues) def.allowedValues.forEach((v) => vocab.add(v));
      });
      map[info.column] = [...vocab];
    }
    return map;
  }, [entries]);

  // Early return rendered AFTER all hooks below — see `noEntries` block.

  // Build flat list of missing cells for the table view
  const flatMissing = useMemo(() => {
    const rows: {
      column: string;
      rowIdx: number;
      context: string;
      mappedTerms: string[];
      topValues: { value: string; count: number }[];
      vocab: string[];
      currentValue: string;
      bulkValue: string;
      isFilled: boolean;
    }[] = [];

    for (const info of entries) {
      const bulkValue = defaultValues[info.column] ?? "";
      for (const idx of info.missingIndices) {
        const rowKey = `${info.column}::row::${idx}`;
        const rowVal = defaultValues[rowKey] ?? "";
        const effective = rowVal || bulkValue;
        const context = data[idx]
          ? Object.entries(data[idx])
              .filter(
                ([k, v]) =>
                  k !== info.column &&
                  v !== undefined &&
                  v !== null &&
                  String(v).trim() !== "",
              )
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
              .join(" · ")
          : "";
        rows.push({
          column: info.column,
          rowIdx: idx,
          context,
          mappedTerms: info.mappedTerms,
          topValues: info.topValues,
          vocab: vocabByColumn[info.column] || [],
          currentValue: rowVal,
          bulkValue,
          isFilled: effective.trim() !== "",
        });
      }
    }
    return rows;
  }, [entries, defaultValues, data, vocabByColumn]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return flatMissing.filter((r) => {
      if (colFilter.size > 0 && !colFilter.has(r.column)) return false;
      if (statusFilter === "filled" && !r.isFilled) return false;
      if (statusFilter === "empty" && r.isFilled) return false;
      if (q && !`${r.column} ${r.context}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [flatMissing, colFilter, statusFilter, searchQuery]);

  const totalCells = flatMissing.length;
  const filledCells = flatMissing.filter((r) => r.isFilled).length;

  const toggleColFilter = (col: string) => {
    setColFilter((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const clearFilters = () => {
    setColFilter(new Set());
    setStatusFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    colFilter.size > 0 || statusFilter !== "all" || searchQuery.trim() !== "";

  // Empty state — after all hooks
  if (entries.length === 0) {
    return (
      <Card className="bg-card/90 border-border backdrop-blur">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            {t("missing.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {t("missing.noneFound")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/90 border-border backdrop-blur">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t("missing.title")}
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 ml-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                {filledCells}/{totalCells}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("missing.desc")}</p>
          </div>
          {/* View switcher */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
              className="h-7 text-xs px-2"
            >
              <TableIcon className="w-3.5 h-3.5 mr-1" />
              {t("missing.viewTable")}
            </Button>
            <Button
              variant={view === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("cards")}
              className="h-7 text-xs px-2"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              {t("missing.viewCards")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {/* ============ TABLE VIEW ============ */}
        {view === "table" && (
          <div className="space-y-3">
            {/* Filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("missing.searchPlaceholder")}
                    className="h-8 text-xs pl-8"
                  />
                </div>
                <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
                  {(["all", "empty", "filled"] as StatusFilter[]).map((s) => (
                    <Button
                      key={s}
                      variant={statusFilter === s ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setStatusFilter(s)}
                      className="h-7 text-[11px] px-2"
                    >
                      {t(`missing.status.${s}`)}
                    </Button>
                  ))}
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-[11px] text-muted-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t("missing.clearFilters")}
                  </Button>
                )}
              </div>

              {/* Column chips filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mr-1">
                  {t("missing.filterByColumn")}
                </span>
                {entries.map((info) => {
                  const active = colFilter.has(info.column);
                  return (
                    <button
                      key={info.column}
                      onClick={() => toggleColFilter(info.column)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                        active
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                      }`}
                    >
                      {info.column}
                      <span className="ml-1 opacity-70">({info.missingIndices.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results count */}
            <p className="text-[11px] text-muted-foreground">
              {t("missing.tableShowing", {
                shown: Math.min(filteredRows.length, 300),
                total: filteredRows.length,
              })}
            </p>

            {/* Missing-cells table */}
            <div className="rounded-lg border border-border overflow-hidden max-h-[60vh] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground w-12">#</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      {t("missing.col.column")}
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      {t("missing.col.context")}
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      {t("missing.col.suggestions")}
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-[28%]">
                      {t("missing.col.value")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground italic">
                        {t("missing.noResults")}
                      </td>
                    </tr>
                  )}
                  {filteredRows.slice(0, 300).map((r) => {
                    // Dla niewypełnionych komórek pokaż KOMPLET słownika DwC (bez "top values").
                    // Dla wypełnionych zostaw skróconą listę sugestii.
                    const suggestions = !r.isFilled
                      ? r.vocab.map((v) => ({ value: v, kind: "vocab" as const, count: undefined as number | undefined }))
                      : [
                          ...r.topValues.slice(0, 3).map((v) => ({ value: v.value, kind: "top" as const, count: v.count as number | undefined })),
                          ...r.vocab.slice(0, 4).map((v) => ({ value: v, kind: "vocab" as const, count: undefined as number | undefined })),
                        ];
                    return (
                      <tr
                        key={`${r.column}::${r.rowIdx}`}
                        className={`border-b border-border/30 last:border-0 ${
                          r.isFilled ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        <td className="px-2 py-1.5 text-right text-muted-foreground font-mono">
                          {r.rowIdx + 1}
                        </td>
                        <td className="px-3 py-1.5 align-top">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-semibold text-foreground text-[11px]">
                              {r.column}
                            </span>
                            {r.mappedTerms.slice(0, 1).map((term) => (
                              <Badge
                                key={term}
                                variant="outline"
                                className="text-[9px] h-4 px-1 text-muted-foreground border-border"
                              >
                                → {term}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground truncate max-w-[260px] align-top">
                          {r.context || "—"}
                        </td>
                        <td className="px-3 py-1.5 align-top">
                          {suggestions.length === 0 ? (
                            <span className="text-muted-foreground italic">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {suggestions.map((s, i) => (
                                <button
                                  key={`${s.kind}-${i}-${s.value}`}
                                  onClick={() => setRowDefault(r.column, r.rowIdx, s.value)}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                    s.kind === "vocab"
                                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/20"
                                      : "border-border bg-card hover:border-primary/50 text-foreground"
                                  }`}
                                  title={s.kind === "vocab" ? t("missing.dwcVocab") : t("missing.topValues")}
                                >
                                  {s.value}
                                  {s.count !== undefined && (
                                    <span className="ml-0.5 opacity-60">×{s.count}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-1.5 align-top">
                          <Input
                            value={r.currentValue}
                            onChange={(e) => setRowDefault(r.column, r.rowIdx, e.target.value)}
                            placeholder={r.bulkValue || "—"}
                            className="h-7 text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredRows.length > 300 && (
              <p className="text-[10px] text-muted-foreground italic">
                {t("missing.rowsTruncated", { shown: 300, total: filteredRows.length })}
              </p>
            )}
          </div>
        )}

        {/* ============ CARDS VIEW ============ */}
        {view === "cards" && entries.map((info) => {
          const { column, missingIndices, totalRows, topValues, mappedTerms } = info;
          const isOpen = expandedCol === column;
          const mode = modePerCol[column] || "bulk";
          const bulkValue = defaultValues[column] ?? "";
          const draft = bulkDrafts[column] ?? bulkValue;

          const rowOverrideCount = Object.keys(defaultValues).filter(
            (k) => k.startsWith(`${column}::row::`),
          ).length;
          const isFullyFilled = !!bulkValue || rowOverrideCount === missingIndices.length;
          const vocabValues = vocabByColumn[column] || [];

          return (
            <div key={column} className="rounded-xl border border-border overflow-hidden">
              <div
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                  isFullyFilled ? "bg-emerald-500/5" : "bg-muted/30 hover:bg-muted/50"
                }`}
                onClick={() => setExpandedCol(isOpen ? null : column)}
              >
                <div className="flex-shrink-0">
                  {isFullyFilled ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{column}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                      {t("missing.emptyCount", { count: missingIndices.length, total: totalRows })}
                    </Badge>
                    {mappedTerms.slice(0, 3).map((term) => (
                      <Badge key={term} variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground border-border">
                        → {term}
                      </Badge>
                    ))}
                    {bulkValue && (
                      <Badge className="text-[10px] h-4 px-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        {t("missing.bulkApplied", { value: bulkValue })}
                      </Badge>
                    )}
                    {!bulkValue && rowOverrideCount > 0 && (
                      <Badge className="text-[10px] h-4 px-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
                        {t("missing.rowEditsCount", { count: rowOverrideCount })}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-3 bg-muted/20 space-y-3">
                      <div className="flex gap-2">
                        <Button
                          variant={mode === "bulk" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setModePerCol((p) => ({ ...p, [column]: "bulk" }))}
                          className="h-7 text-xs"
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          {t("missing.modeBulk")}
                        </Button>
                        <Button
                          variant={mode === "rows" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setModePerCol((p) => ({ ...p, [column]: "rows" }))}
                          className="h-7 text-xs"
                        >
                          <ListChecks className="w-3 h-3 mr-1" />
                          {t("missing.modeRows", { count: missingIndices.length })}
                        </Button>
                        {(bulkValue || rowOverrideCount > 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              clearColumnDefaults(column);
                              setBulkDrafts((p) => ({ ...p, [column]: "" }));
                            }}
                            className="h-7 text-xs text-muted-foreground ml-auto"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            {t("missing.clear")}
                          </Button>
                        )}
                      </div>

                      {mode === "bulk" && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            {t("missing.bulkHint", { count: missingIndices.length })}
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={draft}
                              onChange={(e) => setBulkDrafts((p) => ({ ...p, [column]: e.target.value }))}
                              placeholder={t("missing.bulkPlaceholder")}
                              className="h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => setColumnDefault(column, draft)}
                              disabled={draft === bulkValue}
                              className="h-8 text-xs"
                            >
                              {t("missing.apply")}
                            </Button>
                          </div>

                          {topValues.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                {t("missing.topValues")}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {topValues.map(({ value, count }) => (
                                  <button
                                    key={value}
                                    onClick={() => {
                                      setBulkDrafts((p) => ({ ...p, [column]: value }));
                                      setColumnDefault(column, value);
                                    }}
                                    className="text-xs px-2 py-1 rounded-md border border-border bg-card hover:border-primary/50 transition-colors"
                                  >
                                    {value} <span className="text-muted-foreground">({count}×)</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {vocabValues.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1">
                                <BookMarked className="w-3 h-3" />
                                {t("missing.dwcVocab")}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {vocabValues.map((value) => (
                                  <button
                                    key={value}
                                    onClick={() => {
                                      setBulkDrafts((p) => ({ ...p, [column]: value }));
                                      setColumnDefault(column, value);
                                    }}
                                    className="text-xs px-2 py-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                                  >
                                    {value}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {mode === "rows" && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{t("missing.rowsHint")}</p>
                          <div className="rounded-lg border border-border overflow-hidden max-h-72 overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                                <tr className="border-b border-border">
                                  <th className="px-2 py-1.5 text-right font-medium text-muted-foreground w-14">
                                    {t("missing.rowNumber")}
                                  </th>
                                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                                    {t("missing.contextRow")}
                                  </th>
                                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground w-1/3">
                                    {t("missing.fillValue")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {missingIndices.slice(0, 200).map((idx) => {
                                  const rowKey = `${column}::row::${idx}`;
                                  const rowVal = defaultValues[rowKey] ?? "";
                                  const context = data[idx]
                                    ? Object.entries(data[idx])
                                        .filter(([k, v]) => k !== column && v !== undefined && v !== null && String(v).trim() !== "")
                                        .slice(0, 3)
                                        .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
                                        .join(" · ")
                                    : "";
                                  return (
                                    <tr key={idx} className="border-b border-border/30 last:border-0">
                                      <td className="px-2 py-1 text-right text-muted-foreground font-mono">{idx + 1}</td>
                                      <td className="px-3 py-1 text-muted-foreground truncate max-w-[260px]">
                                        {context || "—"}
                                      </td>
                                      <td className="px-3 py-1">
                                        <Input
                                          value={rowVal}
                                          onChange={(e) => setRowDefault(column, idx, e.target.value)}
                                          placeholder={bulkValue || "—"}
                                          className="h-7 text-xs"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {missingIndices.length > 200 && (
                            <p className="text-[10px] text-muted-foreground italic">
                              {t("missing.rowsTruncated", { shown: 200, total: missingIndices.length })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
