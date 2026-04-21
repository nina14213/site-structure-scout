/**
 * @file WizardStepReview.tsx
 * @description Step 2 of the wizard — review optimal layout, configure ID/dates,
 *   select tables for export, add unmapped columns, preview data, and download.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle, Key, CalendarClock, CheckCircle, Layers, Download,
  Eye, X, Plus, ChevronDown, ChevronUp, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { schemaTypes, schemaTerms } from "./schemaData";
import { isDateTerm } from "./useSchemaExport";
import type { OptimalLayoutItem, ClassifiedSchemas } from "./useSchemaMapperState";
import HelpTooltip from "./HelpTooltip";
import MissingValuesPanel from "./MissingValuesPanel";

interface WizardStepReviewProps {
  optimalLayout: OptimalLayoutItem[];
  mappingsCount: number;
  schemasWithMappingsCount: number;
  schemasWithMappings: string[];
  groupedMappings: Record<string, Record<string, string>>;
  onSelectSchema: (schemaId: string) => void;
  onClearSearch: () => void;
  unmappedRequiredIdTerms: string[];
  onOpenIdGenerator: () => void;
  generatedIdConfigs: { term: string; mode: string }[];
  eventDateIsoSuggestion: {
    nonIsoCount: number;
    totalNonEmpty: number;
    samples: { idx: number; original: string; converted: string; wasConverted: boolean }[];
  } | null;
  applyEventDateIsoSuggestion: () => void;
  // Table selection for export
  selectedForDownload: Set<string>;
  onToggleSchemaSelection: (schemaId: string) => void;
  // Unmapped columns
  unmappedColumns: string[];
  extraColumnsPerSchema: Record<string, string[]>;
  onToggleExtraColumn: (schemaId: string, column: string) => void;
  onSelectAllExtraColumns: (schemaId: string) => void;
  // Preview
  convertDatesToISO: boolean;
  generatedIdValues: Record<string, string[]>;
  getPreviewRows: (termMappings: Record<string, string>) => Record<string, string>[];
  // Download (merged from DownloadPanel)
  classifiedSchemas: ClassifiedSchemas;
  onDownloadAll: () => void;
  onDownloadSchema: (schemaId: string) => void;
  onDownloadFiltered: (filter: 'optimal' | 'optional') => void;
  onDownloadSelected: () => void;
}

export default function WizardStepReview({
  optimalLayout,
  mappingsCount,
  schemasWithMappingsCount,
  schemasWithMappings,
  groupedMappings,
  onSelectSchema,
  onClearSearch,
  unmappedRequiredIdTerms,
  onOpenIdGenerator,
  generatedIdConfigs,
  eventDateIsoSuggestion,
  applyEventDateIsoSuggestion,
  selectedForDownload,
  onToggleSchemaSelection,
  unmappedColumns,
  extraColumnsPerSchema,
  onToggleExtraColumn,
  onSelectAllExtraColumns,
  convertDatesToISO,
  generatedIdValues,
  getPreviewRows,
  classifiedSchemas,
  onDownloadAll,
  onDownloadSchema,
  onDownloadFiltered,
  onDownloadSelected,
}: WizardStepReviewProps) {
  const { t } = useLanguage();

  const hasIdIssues = unmappedRequiredIdTerms.length > 0;
  const hasDateIssues = !!eventDateIsoSuggestion;
  const allGood = !hasIdIssues && !hasDateIssues;

  const [previewSchemaId, setPreviewSchemaId] = useState<string | null>(null);
  const [expandedExtraSchema, setExpandedExtraSchema] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      {/* Checklist (ID / dates) — always show date info */}
      <Card className="bg-card/90 border-border backdrop-blur">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            {allGood ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
            {t("wizard.reviewTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {hasIdIssues && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-medium text-destructive flex items-center gap-1.5">
                      {t("idGen.unmappedIds", { count: unmappedRequiredIdTerms.length })}
                      <HelpTooltip text="Każdy wiersz w tabeli potrzebuje unikalnego identyfikatora (ID). Bez niego systemy nie odróżnią jednego rekordu od drugiego. Kliknij przycisk obok, a system wygeneruje ID automatycznie." />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {unmappedRequiredIdTerms.slice(0, 2).join(", ")}
                      {unmappedRequiredIdTerms.length > 2 && ` +${unmappedRequiredIdTerms.length - 2}`}
                    </p>
                  </div>
                </div>
                <Button onClick={onOpenIdGenerator} className="shrink-0">
                  <Key className="w-4 h-4 mr-2" />
                  {t("wizard.setupIdGenerators")}
                </Button>
              </div>
            </div>
          )}

          {/* Date conversion — always shown when there's a suggestion */}
          {hasDateIssues && eventDateIsoSuggestion && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      {t("schema.eventDateNotIso")}
                      <HelpTooltip text="Standard Darwin Core wymaga dat w formacie ISO 8601 (np. 2024-03-15). System może automatycznie przekonwertować Twoje daty — oryginalne wartości zostaną zachowane w polu 'verbatimEventDate'." />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("schema.eventDateNotIsoDesc", {
                        count: eventDateIsoSuggestion.nonIsoCount,
                        total: eventDateIsoSuggestion.totalNonEmpty,
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={applyEventDateIsoSuggestion}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  {t("schema.applyDateSuggestion")}
                </Button>
              </div>

              {/* Date conversion preview */}
              {eventDateIsoSuggestion.samples.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-2 py-1.5 text-right font-medium text-muted-foreground w-10">#</th>
                        <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                          {t("wizard.dateOriginal")}
                        </th>
                        <th className="px-2 py-1.5 text-center text-muted-foreground w-8">→</th>
                        <th className="px-3 py-1.5 text-left font-medium text-cyan-500">
                          ISO 8601
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventDateIsoSuggestion.samples.map((s, i) => {
                        if (s.idx === -1) {
                          return (
                            <tr key="sep" className="border-b border-border/30">
                              <td colSpan={4} className="px-3 py-1 text-center text-muted-foreground italic text-[11px]">⋯</td>
                            </tr>
                          );
                        }
                        return (
                          <tr key={i} className={`border-b border-border/30 last:border-0 ${s.wasConverted ? 'bg-cyan-500/5' : ''}`}>
                            <td className="px-2 py-1.5 text-right text-muted-foreground font-mono">{s.idx}</td>
                            <td className="px-3 py-1.5 text-muted-foreground font-mono">{s.original}</td>
                            <td className="px-2 py-1.5 text-center text-muted-foreground">{s.wasConverted ? '→' : ''}</td>
                            <td className={`px-3 py-1.5 font-mono font-medium ${
                              s.wasConverted ? 'text-cyan-500' : 'text-muted-foreground'
                            }`}>
                              {s.wasConverted ? s.converted : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Date conversion info — show when convertDatesToISO is on and no issues */}
          {!hasDateIssues && convertDatesToISO && (
            <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-cyan-500 flex-shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-medium">{t("schema.dateConversion")}</span>
                {" — "}
                <span className="text-muted-foreground">{t("schema.dateConversionDesc")}</span>
              </p>
            </div>
          )}

          {allGood && !convertDatesToISO && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                {t("wizard.allGood")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table selection + preview */}
      <Card className="bg-card/90 border-border backdrop-blur">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5 text-emerald-400" />
            {t("wizard.tableSelection")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("wizard.tableSelectionDesc", { terms: mappingsCount, schemas: schemasWithMappingsCount })}
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {schemasWithMappings.map((schemaId) => {
            const info = schemaTypes.find((s) => s.id === schemaId);
            const termCount = Object.keys(groupedMappings[schemaId] || {}).length;
            const isSelected = selectedForDownload.has(schemaId);
            const isPreviewOpen = previewSchemaId === schemaId;
            const isExtraOpen = expandedExtraSchema === schemaId;
            const extras = extraColumnsPerSchema[schemaId] || [];
            const schema = schemaTerms[schemaId];
            const hasReqFields = schema && schema.required.length > 0;

            return (
              <div key={schemaId} className="rounded-xl border border-border overflow-hidden">
                {/* Schema row */}
                <div
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/5" : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  onClick={() => onToggleSchemaSelection(schemaId)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSchemaSelection(schemaId)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  />
                  {info && (
                    <div className={`p-1.5 rounded-lg ${info.color}`}>
                      <info.icon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{info?.name || schemaId}</span>
                      <Badge className={`text-[10px] h-4 px-1 ${hasReqFields ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                        {hasReqFields ? `✓ ${t('schema.optimal')}` : t('schema.optionalTable')}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">{termCount} {t('schema.fieldsCount')}</Badge>
                      {extras.length > 0 && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 border-cyan-500/30 text-cyan-400">
                          +{extras.length} {t("wizard.extraCols")}
                        </Badge>
                      )}
                    </div>
                    {/* Show mapped terms */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.keys(groupedMappings[schemaId] || {}).slice(0, 6).map(term => (
                        <Badge key={term} variant="outline" className="text-[10px] text-muted-foreground border-border">
                          {term}
                        </Badge>
                      ))}
                      {termCount > 6 && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                          +{termCount - 6}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewSchemaId(isPreviewOpen ? null : schemaId)}
                      className={`h-7 px-2 text-xs ${isPreviewOpen ? 'text-cyan-400' : 'text-muted-foreground'}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-tour="extra-columns-btn"
                      onClick={() => setExpandedExtraSchema(isExtraOpen ? null : schemaId)}
                      className={`h-7 px-2 text-xs ${isExtraOpen ? 'text-cyan-400' : 'text-muted-foreground'}`}
                      disabled={unmappedColumns.length === 0}
                      title={t("wizard.addUnmappedCols")}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isExtraOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                {/* Unmapped columns picker */}
                <AnimatePresence>
                  {isExtraOpen && unmappedColumns.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="p-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("wizard.addUnmappedCols")}
                          </p>
                          <button
                            onClick={() => onSelectAllExtraColumns(schemaId)}
                            className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors"
                          >
                            {extras.length === unmappedColumns.length
                              ? t("autoMatch.deselectAll")
                              : t("autoMatch.selectAll")}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {unmappedColumns.map(col => {
                            const isAdded = extras.includes(col);
                            return (
                              <button
                                key={col}
                                onClick={() => onToggleExtraColumn(schemaId, col)}
                                className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                                  isAdded
                                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                                    : "bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground/50"
                                }`}
                              >
                                {isAdded && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                {col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Data preview */}
                <AnimatePresence>
                  {isPreviewOpen && groupedMappings[schemaId] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="overflow-x-auto">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
                          <p className="text-xs font-medium text-foreground">
                            {schemaId}.csv — {t("schema.previewFirstLast")}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewSchemaId(null)}
                            className="h-6 px-2 text-muted-foreground"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {(() => {
                          const previewRows = getPreviewRows(groupedMappings[schemaId]);
                          const nonSeparatorRows = previewRows.filter((r: any) => !r.__separator);
                          const allHeaders = nonSeparatorRows.length > 0
                            ? Object.keys(nonSeparatorRows[0])
                            : Object.keys(groupedMappings[schemaId]);
                          // Add extra columns to headers
                          const extraCols = extraColumnsPerSchema[schemaId] || [];
                          const finalHeaders = [...allHeaders, ...extraCols.filter(c => !allHeaders.includes(c))];

                          return (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  {finalHeaders.map((term) => {
                                    const isISO = term.endsWith('_ISO');
                                    const isGenerated = generatedIdValues[term] !== undefined;
                                    const isExtra = extraCols.includes(term);
                                    return (
                                      <th
                                        key={term}
                                        className={`px-3 py-2 text-left font-mono font-semibold whitespace-nowrap ${
                                          isExtra ? 'text-cyan-400/70 italic' :
                                          isISO ? 'text-cyan-400/70 italic' :
                                          isGenerated ? 'text-amber-400' :
                                          'text-foreground'
                                        }`}
                                      >
                                        {isExtra ? `⊕ ${term}` : isISO ? term.replace('_ISO', ' (ISO)') : term}
                                        {isGenerated && <Key className="inline w-3 h-3 ml-1 text-amber-400" />}
                                        {isDateTerm(term) && convertDatesToISO && !isISO && (
                                          <CalendarClock className="inline w-3 h-3 ml-1 text-cyan-400" />
                                        )}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {previewRows.map((row: any, i: number) => {
                                  if (row.__separator) {
                                    return (
                                      <tr key="separator" className="border-b border-border/30">
                                        <td
                                          colSpan={finalHeaders.length}
                                          className="px-3 py-1.5 text-center text-muted-foreground italic text-[11px]"
                                        >
                                          ⋯
                                        </td>
                                      </tr>
                                    );
                                  }
                                  return (
                                    <tr key={i} className="border-b border-border/30">
                                      {finalHeaders.map((term, j) => {
                                        const isISO = term.endsWith('_ISO');
                                        const isGenerated = generatedIdValues[term] !== undefined;
                                        const isExtra = extraCols.includes(term);
                                        return (
                                          <td
                                            key={j}
                                            className={`px-3 py-1.5 whitespace-nowrap max-w-[180px] truncate ${
                                              isExtra ? 'text-cyan-500 italic' :
                                              isISO ? 'text-cyan-500 font-medium italic' :
                                              isGenerated ? 'text-amber-400 font-mono' :
                                              isDateTerm(term) && convertDatesToISO ? 'text-cyan-500 font-medium' : 'text-muted-foreground'
                                            }`}
                                          >
                                            {row[term] || "—"}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* All good indicator */}
          {allGood && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                {t("wizard.allGood")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation section (inactive) */}
      <Card className="bg-card/90 border-border backdrop-blur opacity-60">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            {t("wizard.validation")}
          </CardTitle>
          <p className="text-sm text-muted-foreground italic">
            {t("wizard.validationInactive")}
          </p>
        </CardHeader>
      </Card>

      {/* Download section */}
      {schemasWithMappings.length > 0 && (
        <Card className="bg-card/90 border-border backdrop-blur">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
              <Download className="w-5 h-5 text-amber-400" />
              {t("schema.downloadPackage")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("schema.downloadPackageDesc")}</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <Button
              onClick={onDownloadAll}
              variant="outline"
              className="w-full py-5 text-base border-amber-500 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
            >
              <Download className="w-5 h-5 mr-2" />
              {t("schema.downloadAll")} ZIP ({schemasWithMappings.length} {t("schema.files")})
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                onClick={() => onDownloadFiltered('optimal')}
                variant="outline"
                disabled={classifiedSchemas.optimal.length === 0}
                className="py-3 text-sm border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-40"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {t("schema.downloadOptimal")} ({classifiedSchemas.optimal.length})
              </Button>
              <Button
                onClick={() => onDownloadFiltered('optional')}
                variant="outline"
                disabled={classifiedSchemas.optional.length === 0}
                className="py-3 text-sm border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 disabled:opacity-40"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {t("schema.downloadOptional")} ({classifiedSchemas.optional.length})
              </Button>
              <Button
                onClick={onDownloadSelected}
                variant="outline"
                disabled={selectedForDownload.size === 0}
                className="py-3 text-sm border-primary/50 text-primary hover:bg-primary/10 disabled:opacity-40"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {t("schema.downloadSelected")} ({selectedForDownload.size})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
