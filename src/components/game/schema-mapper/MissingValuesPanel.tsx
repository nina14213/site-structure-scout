/**
 * @file MissingValuesPanel.tsx
 * @description Panel for filling missing (empty) cells in mapped source columns.
 *
 * Two modes per column:
 *  - Bulk fill: one value applied to ALL empty cells in the column
 *  - Per-row edit: edit each empty cell individually
 *
 * Suggestions: top-3 most frequent existing values + DwC controlled vocabulary
 * (when the column is mapped to a term with allowedValues).
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, AlertTriangle, Wand2, RotateCcw, CheckCircle2, ListChecks, BookMarked } from "lucide-react";
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

export default function MissingValuesPanel({
  missingByColumn,
  data,
  defaultValues,
  setColumnDefault,
  setRowDefault,
  clearColumnDefaults,
}: MissingValuesPanelProps) {
  const { t } = useLanguage();
  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [modePerCol, setModePerCol] = useState<Record<string, "bulk" | "rows">>({});
  const [bulkDrafts, setBulkDrafts] = useState<Record<string, string>>({});

  const entries = useMemo(() => Object.values(missingByColumn), [missingByColumn]);

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
        <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {t("missing.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("missing.desc")}</p>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {entries.map((info) => {
          const { column, missingIndices, totalRows, topValues, mappedTerms } = info;
          const isOpen = expandedCol === column;
          const mode = modePerCol[column] || "bulk";
          const bulkValue = defaultValues[column] ?? "";
          const draft = bulkDrafts[column] ?? bulkValue;

          // Per-row override count
          const rowOverrideCount = Object.keys(defaultValues).filter(
            (k) => k.startsWith(`${column}::row::`),
          ).length;
          const filled = (bulkValue ? missingIndices.length : 0) + (bulkValue ? 0 : rowOverrideCount);
          const isFullyFilled = !!bulkValue || rowOverrideCount === missingIndices.length;

          // Find DwC vocabulary suggestions across mapped terms
          const vocab = new Set<string>();
          mappedTerms.forEach((term) => {
            const t = dwcTerms[term];
            if (t?.allowedValues) t.allowedValues.forEach((v) => vocab.add(v));
          });
          const vocabValues = [...vocab];

          return (
            <div key={column} className="rounded-xl border border-border overflow-hidden">
              {/* Header row */}
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
                      {/* Mode toggle */}
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

                      {/* Bulk mode */}
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

                          {/* Suggestions: top values */}
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

                          {/* Suggestions: DwC vocabulary */}
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

                      {/* Per-row mode */}
                      {mode === "rows" && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            {t("missing.rowsHint")}
                          </p>
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
                                  // Build a small context preview from the row (first non-empty cells)
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
