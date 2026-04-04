/**
 * @file SchemaMapper.tsx
 * @description 3-step wizard for Schema Mapper: Map → Review → Download.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchemaMapperTutorial from "./SchemaMapperTutorial";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Check, Layers, Download, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import AutoMatchDialog from "./AutoMatchDialog";
import IdGeneratorDialog from "./IdGeneratorDialog";
import SuggestMappingDialog, { buildSuggestions, SuggestionItem } from "./SuggestMappingDialog";

import { useSchemaMapperState } from "./schema-mapper/useSchemaMapperState";
import { useSchemaExport } from "./schema-mapper/useSchemaExport";
import ColumnsPanel from "./schema-mapper/ColumnsPanel";
import SchemasPanel from "./schema-mapper/SchemasPanel";
import DownloadPanel from "./schema-mapper/DownloadPanel";
import WizardProgress from "./schema-mapper/WizardProgress";
import WizardStepReview from "./schema-mapper/WizardStepReview";

interface SchemaMapperProps {
  columns: string[];
  data: any[];
  fileName: string;
  onBack: () => void;
  onComplete?: (mappings: Record<string, string>, schema: string) => void;
}

export default function SchemaMapper({ columns, data, fileName, onBack, onComplete }: SchemaMapperProps) {
  const { t, language } = useLanguage();

  // ─── Wizard step ──────────────────────────────────────────────────
  const [wizardStep, setWizardStep] = useState(0);

  const wizardSteps = useMemo(() => [
    { label: t("wizard.step1"), icon: <Layers className="w-4 h-4" /> },
    { label: t("wizard.step2"), icon: <Check className="w-4 h-4" /> },
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
  const canGoNext = wizardStep === 0 ? hasMappings : true;

  // Auto-skip step 2 if nothing to review
  const hasReviewItems = state.unmappedRequiredIdTerms.length > 0 || !!state.eventDateIsoSuggestion || state.optimalLayout.length > 0;

  const goNext = useCallback(() => {
    if (wizardStep === 0 && !hasReviewItems) {
      setWizardStep(2); // skip review
    } else if (wizardStep < 2) {
      setWizardStep(wizardStep + 1);
    }
  }, [wizardStep, hasReviewItems]);

  const goBack = useCallback(() => {
    if (wizardStep === 2 && !hasReviewItems) {
      setWizardStep(0); // skip review going back
    } else if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  }, [wizardStep, hasReviewItems]);

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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Button
                onClick={wizardStep === 0 ? onBack : goBack}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground flex-shrink-0 p-1.5 md:p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground truncate">{t("schema.title")}</h1>
                <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">{t("schema.subtitle")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTutorialPhase(1);
                  setShowTutorial(true);
                }}
                className="text-[10px] md:text-xs border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0 px-2 md:px-3"
              >
                <span className="hidden sm:inline">{t("mapperTutorial.replay")}</span>
                <span className="sm:hidden">🦎</span>
              </Button>
            </div>
          </motion.div>

          {/* Wizard progress */}
          <WizardProgress currentStep={wizardStep} steps={wizardSteps} />

          {/* Step content */}
          <AnimatePresence mode="wait">
            {wizardStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
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

            {wizardStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <WizardStepReview
                  optimalLayout={state.optimalLayout}
                  mappingsCount={Object.keys(state.mappings).length}
                  onSelectSchema={(schemaId) => {
                    state.handleSchemaChange(schemaId);
                    setWizardStep(0);
                  }}
                  onClearSearch={() => state.setSearchTerm("")}
                  unmappedRequiredIdTerms={state.unmappedRequiredIdTerms}
                  onOpenIdGenerator={() => state.setShowIdGenerator(true)}
                  generatedIdConfigs={state.generatedIdConfigs}
                  eventDateIsoSuggestion={state.eventDateIsoSuggestion}
                  applyEventDateIsoSuggestion={state.applyEventDateIsoSuggestion}
                />
              </motion.div>
            )}

            {wizardStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard navigation buttons — sticky on mobile */}
          <div className="sticky bottom-0 z-10 mt-4 md:mt-6 -mx-4 md:mx-0 px-4 md:px-0 py-3 md:py-0 bg-gradient-to-t from-indigo-50 via-indigo-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 md:bg-none md:static">
            <div className="flex justify-between items-center">
              <div>
                {wizardStep > 0 && (
                  <Button variant="outline" onClick={goBack} className="gap-1.5 md:gap-2 text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    {t("wizard.back")}
                  </Button>
                )}
              </div>
              <div>
                {wizardStep < 2 && (
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
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Hint when no mappings */}
            {wizardStep === 0 && !hasMappings && (
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
