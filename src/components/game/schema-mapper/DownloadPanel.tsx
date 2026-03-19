/**
 * @file DownloadPanel.tsx
 * @description Panel pobierania danych — eksport zmapowanych schematów jako CSV/ZIP.
 *
 * Funkcje:
 * - Przełącznik konwersji dat do ISO 8601
 * - Przycisk generatora ID (z liczbą skonfigurowanych termów)
 * - Karty schematów z checkboxami do ręcznego wyboru
 * - Podgląd danych (tabela z 5 pierwszymi wierszami)
 * - Przyciski pobierania: wszystkie / optymalne / opcjonalne / wybrane
 */

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download, CalendarClock, Key, Eye, Check, X, AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { schemaTypes } from "./schemaData";
import { isDateTerm } from "./useSchemaExport";
import type { ClassifiedSchemas } from "./useSchemaMapperState";

interface DownloadPanelProps {
  schemasWithMappings: string[];
  groupedMappings: Record<string, Record<string, string>>;
  convertDatesToISO: boolean;
  onToggleDateConversion: () => void;
  unmappedRequiredIdTerms: string[];
  generatedIdConfigs: { term: string; mode: string }[];
  onOpenIdGenerator: () => void;
  classifiedSchemas: ClassifiedSchemas;
  previewSchemaId: string | null;
  onSetPreviewSchemaId: (id: string | null) => void;
  selectedForDownload: Set<string>;
  onToggleSchemaSelection: (schemaId: string) => void;
  generatedIdValues: Record<string, string[]>;
  getPreviewRows: (termMappings: Record<string, string>) => Record<string, string>[];
  onDownloadAll: () => void;
  onDownloadSchema: (schemaId: string) => void;
  onDownloadFiltered: (filter: 'optimal' | 'optional') => void;
  onDownloadSelected: () => void;
}

export default function DownloadPanel({
  schemasWithMappings,
  groupedMappings,
  convertDatesToISO,
  onToggleDateConversion,
  unmappedRequiredIdTerms,
  generatedIdConfigs,
  onOpenIdGenerator,
  classifiedSchemas,
  previewSchemaId,
  onSetPreviewSchemaId,
  selectedForDownload,
  onToggleSchemaSelection,
  generatedIdValues,
  getPreviewRows,
  onDownloadAll,
  onDownloadSchema,
  onDownloadFiltered,
  onDownloadSelected,
}: DownloadPanelProps) {
  const { t } = useLanguage();

  if (schemasWithMappings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mt-6"
    >
      <Card data-tour="download-panel" className="bg-card/90 border-border backdrop-blur">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <Download className="w-5 h-5 text-amber-400" />
            {t("schema.downloadPackage")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("schema.downloadPackageDesc")}</p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Date conversion toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <CalendarClock className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t("schema.dateConversion")}</p>
              <p className="text-xs text-muted-foreground">{t("schema.dateConversionDesc")}</p>
            </div>
            <Button
              size="sm"
              variant={convertDatesToISO ? "default" : "outline"}
              onClick={onToggleDateConversion}
              className={convertDatesToISO ? "bg-cyan-600 hover:bg-cyan-700 text-white" : ""}
            >
              <CalendarClock className="w-4 h-4 mr-1" />
              {convertDatesToISO ? t("schema.datesConverted") : t("schema.convertDates")}
            </Button>
          </div>

          {/* ID Generator button */}
          {(unmappedRequiredIdTerms.length > 0 || generatedIdConfigs.length > 0) && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-amber-500/30">
              <Key className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t('schema.generateIds')}</p>
                <p className="text-xs text-muted-foreground">
                  {unmappedRequiredIdTerms.join(', ')}
                </p>
              </div>
              <Button
                size="sm"
                variant={generatedIdConfigs.length > 0 ? "default" : "outline"}
                onClick={onOpenIdGenerator}
                className={generatedIdConfigs.length > 0 ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-amber-500/50 text-amber-400"}
              >
                <Key className="w-4 h-4 mr-1" />
                {generatedIdConfigs.length > 0
                  ? `${generatedIdConfigs.filter(c => c.mode !== 'skip').length} ${t('idGen.generated')}`
                  : t('schema.generateIds')}
              </Button>
            </div>
          )}

          {/* Schema file cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {schemasWithMappings.map((schemaId) => {
              const info = schemaTypes.find((s) => s.id === schemaId);
              const termCount = Object.keys(groupedMappings[schemaId]).length;
              const isPreviewOpen = previewSchemaId === schemaId;
              const isSelected = selectedForDownload.has(schemaId);
              return (
                <div key={schemaId} className="flex flex-col gap-1">
                  <div
                    onClick={() => onToggleSchemaSelection(schemaId)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : isPreviewOpen
                          ? "border-cyan-500/50 bg-cyan-500/10"
                          : "border-border bg-muted/50 hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    {info && (
                      <div className={`p-1.5 rounded-lg ${info.color}`}>
                        <info.icon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{info?.name || schemaId}</p>
                      <p className="text-xs text-muted-foreground">{termCount} {t("schema.fieldsCount")}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetPreviewSchemaId(previewSchemaId === schemaId ? null : schemaId)}
                      className="text-xs text-muted-foreground hover:text-foreground flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {t("schema.preview")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadSchema(schemaId)}
                      className="text-xs text-muted-foreground hover:text-foreground flex-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      CSV
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data preview table */}
          <AnimatePresence>
            {previewSchemaId && groupedMappings[previewSchemaId] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-border bg-muted/30 overflow-x-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {previewSchemaId}.csv — {t("schema.previewFirst5")}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetPreviewSchemaId(null)}
                      className="h-6 px-2 text-muted-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    {(() => {
                      const previewRows = getPreviewRows(groupedMappings[previewSchemaId]);
                      const allHeaders = previewRows.length > 0
                        ? Object.keys(previewRows[0])
                        : Object.keys(groupedMappings[previewSchemaId]);
                      return (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border">
                              {allHeaders.map((term) => {
                                const isISO = term.endsWith('_ISO');
                                const isGenerated = generatedIdValues[term] !== undefined;
                                return (
                                  <th
                                    key={term}
                                    className={`px-3 py-2 text-left font-mono font-semibold whitespace-nowrap ${
                                      isISO ? 'text-cyan-400/70 italic' :
                                      isGenerated ? 'text-amber-400' :
                                      'text-foreground'
                                    }`}
                                  >
                                    {isISO ? term.replace('_ISO', ' (ISO)') : term}
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
                            {previewRows.map((row, i) => (
                              <tr key={i} className="border-b border-border/30">
                                {allHeaders.map((term, j) => {
                                  const isISO = term.endsWith('_ISO');
                                  const isGenerated = generatedIdValues[term] !== undefined;
                                  return (
                                    <td
                                      key={j}
                                      className={`px-3 py-1.5 whitespace-nowrap max-w-[180px] truncate ${
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
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Missing IDs warning */}
          {unmappedRequiredIdTerms.length > 0 && generatedIdConfigs.filter(c => c.mode !== 'skip').length === 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                {t('schema.missingIdsWarning').replace('{terms}', unmappedRequiredIdTerms.join(', '))}
              </p>
            </div>
          )}

          {/* Download buttons */}
          <div className="space-y-2">
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
