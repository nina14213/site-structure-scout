/**
 * @file SchemaMapper.tsx
 * @description 3-step wizard: Import → Map → Review & Download.
 *
 * If columns/data/fileName are provided (e.g. from game levels),
 * the wizard starts at step 1 (Map). Otherwise it starts at step 0 (Import).
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchemaMapperTutorial from "./SchemaMapperTutorial";
import DataImportTutorial from "./DataImportTutorial";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Check, Upload, Layers, Download, ChevronLeft, HelpCircle, FileText, Database, BookOpen, Undo2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import AutoMatchDialog from "./AutoMatchDialog";
import IdGeneratorDialog from "./IdGeneratorDialog";
import SuggestMappingDialog, { buildSuggestions, SuggestionItem } from "./SuggestMappingDialog";

import { useSchemaMapperState } from "./schema-mapper/useSchemaMapperState";
import { useSchemaExport } from "./schema-mapper/useSchemaExport";
import ColumnsPanel from "./schema-mapper/ColumnsPanel";
import SchemasPanel from "./schema-mapper/SchemasPanel";
import ImportPanel from "./schema-mapper/ImportPanel";
import WizardProgress from "./schema-mapper/WizardProgress";
import WizardStepReview from "./schema-mapper/WizardStepReview";
import SaveProgressButton from "./schema-mapper/SaveProgressButton";
import MappingCelebration from "./schema-mapper/MappingCelebration";
import { Card, CardContent } from "@/components/ui/card";

interface SchemaMapperProps {
  columns?: string[];
  data?: any[];
  fileName?: string;
  onBack: () => void;
  onComplete?: (mappings: Record<string, string>, schema: string) => void;
}

export default function SchemaMapper({ columns: initColumns, data: initData, fileName: initFileName, onBack, onComplete }: SchemaMapperProps) {
  const { t, language } = useLanguage();

  // ─── Import state (managed internally) ────────────────────────────
  const [importedData, setImportedData] = useState<{ data: any[]; columns: string[]; fileName: string } | null>(
    initColumns && initData && initFileName ? { data: initData, columns: initColumns, fileName: initFileName } : null
  );

  const hasExternalData = !!(initColumns && initData && initFileName);
  const columns = importedData?.columns || [];
  const data = importedData?.data || [];
  const fileName = importedData?.fileName || "";

  // ─── Wizard step ──────────────────────────────────────────────────
  const TOTAL_STEPS = 4;
  const [wizardStep, setWizardStep] = useState(hasExternalData ? 2 : 0);

  const wizardSteps = useMemo(() => [
    { label: t("wizard.step0"), icon: <BookOpen className="w-4 h-4" /> },
    { label: t("wizard.step1"), icon: <Upload className="w-4 h-4" /> },
    { label: t("wizard.step2"), icon: <Layers className="w-4 h-4" /> },
    { label: t("wizard.step3"), icon: <Download className="w-4 h-4" /> },
  ], [t]);

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

  // ─── Import tutorial state ────────────────────────────────────────
  const [showImportTutorial, setShowImportTutorial] = useState(false);

  const handleImportTutorialDismiss = useCallback(() => {
    try { localStorage.setItem("dwc-import-tutorial-seen", "1"); } catch {}
    setShowImportTutorial(false);
  }, []);

  // ─── Core state hook (only active when data is loaded) ────────────
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
    extraColumnsPerSchema: state.extraColumnsPerSchema,
    defaultValues: state.defaultValues,
  });

  // ─── Import complete handler ──────────────────────────────────────
  const handleImportComplete = useCallback((importData: any[], importColumns: string[], importFileName: string) => {
    setImportedData({ data: importData, columns: importColumns, fileName: importFileName });
  }, []);

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
      try { localStorage.setItem("dwc-mapper-tutorial-seen", "1"); } catch {}
    } else {
      try { localStorage.setItem("dwc-mapper-tutorial-phase2-seen", "1"); } catch {}
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

  // ─── Wizard navigation ───────────────────────────────────────────
  const hasMappings = Object.keys(state.mappings).length > 0;
  const canGoNext = wizardStep === 0 ? true : wizardStep === 1 ? !!importedData : wizardStep === 2 ? hasMappings : true;

  // Auto-skip review part logic (review is now merged with download in step 2)
  const hasReviewItems = state.unmappedRequiredIdTerms.length > 0 || !!state.eventDateIsoSuggestion || state.optimalLayout.length > 0;

  const goNext = useCallback(() => {
    if (wizardStep < TOTAL_STEPS - 1) {
      setWizardStep(wizardStep + 1);
    }
  }, [wizardStep]);

  const goBack = useCallback(() => {
    if (wizardStep === 2 && hasExternalData) {
      onBack();
      return;
    }
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  }, [wizardStep, hasExternalData, onBack]);

  return (
    <>
      {/* Tutorial overlay */}
      {showTutorial && wizardStep >= 2 && (
        <SchemaMapperTutorial
          phase={tutorialPhase}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
        />
      )}

      {/* Celebration tracker */}
      <MappingCelebration mappingsCount={Object.keys(state.mappings).length} />

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

      {/* Suggest mapping dialog */}
      <AnimatePresence>
        {suggestDialogItems && suggestDialogItems.length > 0 && (
          <SuggestMappingDialog
            suggestions={suggestDialogItems}
            onApply={handleSuggestApply}
            onDismiss={() => setSuggestDialogItems(null)}
          />
        )}
      </AnimatePresence>

      {/* ID Generator dialog */}
      <IdGeneratorDialog
        open={state.showIdGenerator}
        requiredIdTerms={state.unmappedRequiredIdTerms}
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Button
                onClick={wizardStep === 0 || (wizardStep === 2 && hasExternalData) ? onBack : goBack}
                variant="ghost"
                size="sm"
                aria-label={t("wizard.back")}
                className="text-muted-foreground hover:text-foreground flex-shrink-0 p-1.5 md:p-2"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-400 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground truncate">{t("schema.title")}</h1>
                <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">{t("schema.subtitle")}</p>
              </div>
              {wizardStep >= 2 && (
                <div className="flex items-center gap-1.5">
                  {/* Undo button */}
                  {state.mappingsHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={state.handleUndo}
                      aria-label="Cofnij ostatnia zmiane"
                      className="text-[10px] md:text-xs border-border text-muted-foreground hover:text-foreground gap-1 px-2 md:px-3"
                      title="Cofnij ostatnią zmianę"
                    >
                      <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Cofnij</span>
                    </Button>
                  )}
                  {/* Save progress */}
                  <SaveProgressButton
                    mappings={state.mappings}
                    fileName={fileName}
                    selectedSchema={state.selectedSchema}
                  />
                  {/* Tutorial replay */}
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={t("mapperTutorial.replay")}
                    onClick={() => {
                      setTutorialPhase(1);
                      setShowTutorial(true);
                    }}
                    className="text-[10px] md:text-xs border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0 px-2 md:px-3"
                  >
                    <span className="hidden sm:inline">{t("mapperTutorial.replay")}</span>
                    <span className="sm:hidden">🐙</span>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Wizard progress */}
          <WizardProgress currentStep={wizardStep} steps={wizardSteps} />

          {/* Step content */}
          <AnimatePresence mode="wait">
            {/* Step 0: Intro */}
            {wizardStep === 0 && (
              <motion.div
                key="step-intro"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <div className="max-w-2xl mx-auto space-y-6">
                  <Card className="bg-card/90 border-border backdrop-blur">
                    <CardContent className="p-6 md:p-8">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                          <Sparkles className="w-8 h-8 text-primary" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{t("wizard.introTitle")}</h2>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{t("wizard.introDesc")}</p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Database className="w-6 h-6 text-primary" aria-hidden="true" />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground text-sm md:text-base">{t("wizard.introHaveData")}</p>
                            <p className="text-muted-foreground text-xs md:text-sm mt-1">{t("wizard.introHaveDataDesc")}</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowImportTutorial(true);
                            setWizardStep(1);
                          }}
                          className="group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border bg-card hover:border-secondary hover:bg-secondary/5 transition-all text-left"
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                            <BookOpen className="w-6 h-6 text-secondary" aria-hidden="true" />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground text-sm md:text-base">{t("wizard.introNoData")}</p>
                            <p className="text-muted-foreground text-xs md:text-sm mt-1">{t("wizard.introNoDataDesc")}</p>
                          </div>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Step 1: Import (with optional tutorial overlay) */}
            {wizardStep === 1 && (
              <motion.div
                key="step-import"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                {showImportTutorial ? (
                  <DataImportTutorial
                    onComplete={handleImportTutorialDismiss}
                    onSkip={handleImportTutorialDismiss}
                  />
                ) : (
                  <>
                    <div className="flex justify-end mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImportTutorial(true)}
                        className="text-[10px] md:text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">{t("importTutorial.replay")}</span>
                        <span className="sm:hidden">?</span>
                      </Button>
                    </div>
                    <ImportPanel onImportComplete={handleImportComplete} />
                  </>
                )}
              </motion.div>
            )}

            {/* Step 2: Map columns */}
            {wizardStep === 2 && importedData && (
              <motion.div
                key="step-map"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ColumnsPanel
                    columns={columns}
                    dataRowCount={data.length}
                    mappedColumnsCount={columns.filter(c => state.getColumnMapping(c) !== null).length}
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
                    columnSuggestions={state.columnSuggestions}
                    onApplySuggestion={(col, term) => {
                      state.updateMappings(prev => ({ ...prev, [term]: col }));
                    }}
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
                    onSuggestMapping={openSuggestDialog}
                    suggestionsCount={buildSuggestions(columns, data, state.getColumnMapping).length}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Download (merged) */}
            {wizardStep === 3 && importedData && (
              <motion.div
                key="step-review-download"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <WizardStepReview
                  optimalLayout={state.optimalLayout}
                  mappingsCount={Object.keys(state.mappings).length}
                  schemasWithMappingsCount={state.schemasWithMappings.length}
                  schemasWithMappings={state.schemasWithMappings}
                  groupedMappings={state.groupedMappings}
                  onSelectSchema={(schemaId) => {
                    state.handleSchemaChange(schemaId);
                    setWizardStep(2);
                  }}
                  onClearSearch={() => state.setSearchTerm("")}
                  unmappedRequiredIdTerms={state.unmappedRequiredIdTerms}
                  onOpenIdGenerator={() => state.setShowIdGenerator(true)}
                  generatedIdConfigs={state.generatedIdConfigs}
                  eventDateIsoSuggestion={state.eventDateIsoSuggestion}
                  applyEventDateIsoSuggestion={state.applyEventDateIsoSuggestion}
                  selectedForDownload={state.selectedForDownload}
                  onToggleSchemaSelection={toggleSchemaSelection}
                  unmappedColumns={state.unmappedColumns}
                  extraColumnsPerSchema={state.extraColumnsPerSchema}
                  onToggleExtraColumn={state.toggleExtraColumn}
                  onSelectAllExtraColumns={state.selectAllExtraColumns}
                  convertDatesToISO={state.convertDatesToISO}
                  generatedIdValues={state.generatedIdValues}
                  getPreviewRows={exportUtils.getPreviewRows}
                  // Download props (merged from DownloadPanel)
                  classifiedSchemas={state.classifiedSchemas}
                  onDownloadAll={exportUtils.handleDownloadAll}
                  onDownloadSchema={exportUtils.handleDownloadSchema}
                  onDownloadFiltered={exportUtils.handleDownloadFiltered}
                  onDownloadSelected={exportUtils.handleDownloadSelected}
                  // Missing values
                  data={data}
                  missingByColumn={state.missingByColumn}
                  defaultValues={state.defaultValues}
                  setColumnDefault={state.setColumnDefault}
                  setRowDefault={state.setRowDefault}
                  clearColumnDefaults={state.clearColumnDefaults}
                />

                {/* Complete button */}
                {onComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4"
                  >
                    <Button
                      onClick={handleComplete}
                      disabled={!state.allRequiredMapped}
                      className={`w-full py-4 md:py-6 text-base md:text-lg ${
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
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard navigation buttons — sticky on mobile */}
          <div className="sticky bottom-0 z-10 mt-4 md:mt-6 -mx-4 md:mx-0 px-4 md:px-0 py-3 md:py-0 bg-gradient-to-t from-indigo-50 via-indigo-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 md:bg-none md:static">
            <div className="flex justify-between items-center">
              <div>
                {wizardStep > 0 && (
                  <Button variant="outline" onClick={goBack} className="gap-1.5 md:gap-2 text-sm">
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    {t("wizard.back")}
                  </Button>
                )}
              </div>
              <div>
                {wizardStep > 0 && wizardStep < TOTAL_STEPS - 1 && (
                  <Button
                    onClick={goNext}
                    disabled={!canGoNext}
                    className={`gap-1.5 md:gap-2 text-sm ${
                      canGoNext
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : ""
                    }`}
                  >
                    {t("wizard.next")}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>

            {/* Hint when no mappings */}
            {wizardStep === 2 && !hasMappings && (
              <p className="text-center text-xs md:text-sm text-muted-foreground mt-2">
                {t("wizard.noMappingsYet")}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
