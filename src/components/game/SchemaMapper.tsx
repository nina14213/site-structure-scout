/**
 * @file SchemaMapper.tsx
 * @description Główny komponent Schema Mappera — orkiestruje pod-komponenty i hooki.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchemaMapperTutorial from "./SchemaMapperTutorial";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Check, AlertTriangle, Key, CalendarClock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import AutoMatchDialog from "./AutoMatchDialog";
import IdGeneratorDialog from "./IdGeneratorDialog";
import SuggestMappingDialog, { buildSuggestions, SuggestionItem } from "./SuggestMappingDialog";

import { useSchemaMapperState } from "./schema-mapper/useSchemaMapperState";
import { useSchemaExport } from "./schema-mapper/useSchemaExport";
import ColumnsPanel from "./schema-mapper/ColumnsPanel";
import SchemasPanel from "./schema-mapper/SchemasPanel";
import OptimalLayoutPanel from "./schema-mapper/OptimalLayoutPanel";
import DownloadPanel from "./schema-mapper/DownloadPanel";

interface SchemaMapperProps {
  columns: string[];
  data: any[];
  fileName: string;
  onBack: () => void;
  onComplete?: (mappings: Record<string, string>, schema: string) => void;
}

export default function SchemaMapper({ columns, data, fileName, onBack, onComplete }: SchemaMapperProps) {
  const { t, language } = useLanguage();

  // ─── Tutorial state ────────────────────────────────────────────────
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem("dwc-mapper-tutorial-seen");
    } catch {
      return true;
    }
  });
  const [tutorialPhase, setTutorialPhase] = useState<1 | 2>(1);
  const phase2ShownRef = useRef(false);

  // ─── Core state hook ──────────────────────────────────────────────
  const state = useSchemaMapperState({ columns, data, fileName, language });

  // ─── Export hook ──────────────────────────────────────────────────
  const exportUtils = useSchemaExport({
    data,
    fileName,
    convertDatesToISO: state.convertDatesToISO,
    generatedIdConfigs: state.generatedIdConfigs,
    generatedIdValues: state.generatedIdValues,
    getMappingsBySchema: state.getMappingsBySchema,
    classifiedSchemas: state.classifiedSchemas,
    selectedForDownload: state.selectedForDownload,
  });

  // ─── Tutorial phase 2 trigger ─────────────────────────────────────
  useEffect(() => {
    if (phase2ShownRef.current) return;
    const hasMappings = Object.keys(state.mappings).length > 0;
    const phase1Done = localStorage.getItem("dwc-mapper-tutorial-seen") === "1";
    const phase2Done = localStorage.getItem("dwc-mapper-tutorial-phase2-seen");
    if (hasMappings && phase1Done && !phase2Done && !showTutorial) {
      phase2ShownRef.current = true;
      setTutorialPhase(2);
      setShowTutorial(true);
    }
  }, [state.mappings, showTutorial]);

  const handleTutorialComplete = useCallback(() => {
    if (tutorialPhase === 1) {
      try {
        localStorage.setItem("dwc-mapper-tutorial-seen", "1");
      } catch {}
    } else {
      try {
        localStorage.setItem("dwc-mapper-tutorial-phase2-seen", "1");
      } catch {}
    }
    setShowTutorial(false);
  }, [tutorialPhase]);

  const handleComplete = useCallback(() => {
    if (state.allRequiredMapped) {
      onComplete?.(state.mappings, state.selectedSchema);
    }
  }, [state.allRequiredMapped, state.mappings, state.selectedSchema, onComplete]);

  const toggleSchemaSelection = useCallback(
    (schemaId: string) => {
      state.setSelectedForDownload((prev) => {
        const next = new Set(prev);
        if (next.has(schemaId)) next.delete(schemaId);
        else next.add(schemaId);
        return next;
      });
    },
    [state.setSelectedForDownload],
  );

  // ─── Suggest mapping dialog state ─────────────────────────────────
  const [suggestDialogItems, setSuggestDialogItems] = useState<SuggestionItem[] | null>(null);

  const openSuggestDialog = useCallback(() => {
    const items = buildSuggestions(columns, data, state.getColumnMapping);
    if (items.length > 0) setSuggestDialogItems(items);
  }, [columns, data, state.getColumnMapping]);

  const handleSuggestApply = useCallback((selected: SuggestionItem[]) => {
    state.updateMappings(prev => {
      const next = { ...prev };
      for (const item of selected) {
        if (!next[item.term]) next[item.term] = item.column;
      }
      return next;
    });
    setSuggestDialogItems(null);
  }, [state.updateMappings]);

  return (
    <>
      {/* Tutorial overlay */}
      {showTutorial && (
        <SchemaMapperTutorial
          phase={tutorialPhase}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
        />
      )}

      {/* Auto-match dialog */}
      <AnimatePresence>
        {state.showAutoMatch && state.autoMatchResults.length > 0 && (
          <AutoMatchDialog
            matches={state.autoMatchResults}
            onApply={state.handleAutoMatchApply}
            onDismiss={() => state.setShowAutoMatch(false)}
          />
        )}
      </AnimatePresence>

      {/* ID Generator dialog - TYLKO po przycisku */}
      <IdGeneratorDialog
        open={state.showIdGenerator}
        requiredIdTerms={state.allRequiredIdTerms}
        columns={columns}
        data={data}
        existingMappings={state.mappings}
        existingConfigs={state.generatedIdConfigs}
        onApply={(configs) => {
          state.saveIdConfigs(configs);
          state.setShowIdGenerator(false);
        }}
        onDismiss={() => state.setShowIdGenerator(false)}
      />

      {/* Main layout */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Sparkles className="w-8 h-8 text-purple-400" />
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("schema.title")}</h1>
                <p className="text-muted-foreground">{t("schema.subtitle")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTutorialPhase(1);
                  setShowTutorial(true);
                }}
                className="text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                {t("mapperTutorial.replay")}
              </Button>
            </div>
          </motion.div>

          {/* Two-column layout: Columns + Schemas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ColumnsPanel
              columns={columns}
              dataRowCount={data.length}
              selectedColumn={state.selectedColumn}
              draggedColumn={state.draggedColumn}
              onTapSelectColumn={state.handleTapSelectColumn}
              onDragStart={state.handleDragStart}
              onDragEnd={() => state.setDraggedColumn(null)}
              onClearSelectedColumn={() => state.setSelectedColumn(null)}
              getColumnMapping={state.getColumnMapping}
              getAllColumnMappings={state.getAllColumnMappings}
              getSampleValues={state.getSampleValues}
              onRemoveMapping={state.handleRemoveMapping}
              onSuggestMapping={() => {
                // Apply all column suggestions that aren't already mapped
                state.updateMappings(prev => {
                  const next = { ...prev };
                  for (const col of columns) {
                    const colNorm = normalizeHeader(col);
                    // Find matching official term
                    let match: string | null = null;
                    for (const term of OFFICIAL_DWC_TERMS) {
                      if (normalizeHeader(term) === colNorm) { match = term; break; }
                    }
                    if (!match) {
                      for (const [term, aliases] of Object.entries(termAliases)) {
                        if (!OFFICIAL_DWC_TERMS_SET.has(term)) continue;
                        if (aliases.some(a => normalizeHeader(a) === colNorm)) { match = term; break; }
                      }
                    }
                    if (match && !next[match]) {
                      next[match] = col;
                    }
                  }
                  return next;
                });
              }}
              hasSuggestions={columns.some(col => {
                const colNorm = normalizeHeader(col);
                const mapped = state.getColumnMapping(col);
                if (mapped) return false;
                const exact = OFFICIAL_DWC_TERMS.find(t => normalizeHeader(t) === colNorm);
                if (exact) return true;
                for (const [term, aliases] of Object.entries(termAliases)) {
                  if (!OFFICIAL_DWC_TERMS_SET.has(term)) continue;
                  if (aliases.some(a => normalizeHeader(a) === colNorm)) return true;
                }
                return false;
              })}
            />

            <SchemasPanel
              searchTerm={state.searchTerm}
              onSearchChange={state.setSearchTerm}
              mappings={state.mappings}
              selectedColumn={state.selectedColumn}
              schemasWithMappings={state.schemasWithMappings}
              optimalLayout={state.optimalLayout}
              dismissedSchemas={state.dismissedSchemas}
              onDismissSchema={state.setDismissedSchemas}
              columns={columns}
              onDrop={state.handleDrop}
              onRemoveMapping={state.handleRemoveMapping}
              onTapAssignTerm={state.handleTapAssignTerm}
              onAutoMap={state.handleAutoMap}
              onReset={state.handleReset}
              onDetectHeaders={state.handleDetectHeaders}
              updateMappings={state.updateMappings}
              findBestColumnMatch={state.findBestColumnMatch}
              generatedIdConfigs={state.generatedIdConfigs}
              classifiedSchemas={state.classifiedSchemas}
              forcedSchemas={state.forcedSchemas}
              onToggleForceSchema={state.toggleForcedSchema}
            />
          </div>

          {/* ID Generator warning + button */}
          {state.unmappedRequiredIdTerms.length > 0 && (
            <div className="lg:col-span-2 mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">
                      {t("idGen.missingRequired", { count: state.unmappedRequiredIdTerms.length })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {state.unmappedRequiredIdTerms.slice(0, 2).join(", ")}
                      {state.unmappedRequiredIdTerms.length > 2 && ` +${state.unmappedRequiredIdTerms.length - 2}`}
                    </p>
                  </div>
                </div>
                <Button onClick={() => state.setShowIdGenerator(true)} className="shrink-0">
                  <Key className="w-4 h-4 mr-2" />
                  Ustaw generatory ID
                </Button>
              </div>
            </div>
          )}

          {/* eventDate ISO conversion suggestion */}
          {state.eventDateIsoSuggestion && (
            <div className="lg:col-span-2 mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      {t("schema.eventDateNotIso")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("schema.eventDateNotIsoDesc", {
                        count: state.eventDateIsoSuggestion.nonIsoCount,
                        total: state.eventDateIsoSuggestion.totalNonEmpty,
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={state.applyEventDateIsoSuggestion}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  {t("schema.applyDateSuggestion")}
                </Button>
              </div>
            </div>
          )}

          {/* Optimal layout panel */}
          <OptimalLayoutPanel
            optimalLayout={state.optimalLayout}
            mappingsCount={Object.keys(state.mappings).length}
            onSelectSchema={state.handleSchemaChange}
            onClearSearch={() => state.setSearchTerm("")}
          />

          {/* Download panel */}
          <DownloadPanel
            schemasWithMappings={state.schemasWithMappings}
            groupedMappings={state.groupedMappings}
            convertDatesToISO={state.convertDatesToISO}
            onToggleDateConversion={() => {
              state.setConvertDatesToISO((prev) => !prev);
              if (!state.convertDatesToISO && state.schemasWithMappings.length > 0 && !state.previewSchemaId) {
                state.setPreviewSchemaId(state.schemasWithMappings[0]);
              }
            }}
            unmappedRequiredIdTerms={state.unmappedRequiredIdTerms}
            generatedIdConfigs={state.generatedIdConfigs}
            onOpenIdGenerator={() => state.setShowIdGenerator(true)}
            classifiedSchemas={state.classifiedSchemas}
            previewSchemaId={state.previewSchemaId}
            onSetPreviewSchemaId={state.setPreviewSchemaId}
            selectedForDownload={state.selectedForDownload}
            onToggleSchemaSelection={toggleSchemaSelection}
            generatedIdValues={state.generatedIdValues}
            getPreviewRows={exportUtils.getPreviewRows}
            onDownloadAll={exportUtils.handleDownloadAll}
            onDownloadSchema={exportUtils.handleDownloadSchema}
            onDownloadFiltered={exportUtils.handleDownloadFiltered}
            onDownloadSelected={exportUtils.handleDownloadSelected}
          />

          {/* Complete button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex gap-4"
          >
            <Button
              onClick={handleComplete}
              disabled={!state.allRequiredMapped}
              className={`flex-1 py-6 text-lg ${
                state.allRequiredMapped
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {state.allRequiredMapped ? (
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  {t("schema.continueValidation")}
                </span>
              ) : (
                <span>{t("schema.mapAllRequired")}</span>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
