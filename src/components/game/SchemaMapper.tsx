/**
 * @file SchemaMapper.tsx
 * @description Główny komponent Schema Mappera — orkiestruje pod-komponenty i hooki.
 *
 * Architektura po refaktoryzacji:
 * - schemaData.ts — definicje schematów i termów DwC-DP
 * - useSchemaMapperState.ts — stan, persystencja, logika mapowania
 * - useSchemaExport.ts — generowanie CSV, podgląd, pobieranie ZIP
 * - ColumnsPanel.tsx — panel kolumn źródłowych (lewy)
 * - SchemasPanel.tsx — panel schematów DwC-DP (prawy)
 * - OptimalLayoutPanel.tsx — wizualizacja optymalnego układu tabel
 * - DownloadPanel.tsx — eksport i pobieranie danych
 * - TermDropZone.tsx — strefa upuszczania dla pojedynczego termu
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchemaMapperTutorial from "./SchemaMapperTutorial";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import AutoMatchDialog from "./AutoMatchDialog";
import IdGeneratorDialog from "./IdGeneratorDialog";

// Extracted modules
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
    try { return !localStorage.getItem('dwc-mapper-tutorial-seen'); } catch { return true; }
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
    const phase1Done = localStorage.getItem('dwc-mapper-tutorial-seen') === '1';
    const phase2Done = localStorage.getItem('dwc-mapper-tutorial-phase2-seen');
    if (hasMappings && phase1Done && !phase2Done && !showTutorial) {
      phase2ShownRef.current = true;
      setTutorialPhase(2);
      setShowTutorial(true);
    }
  }, [state.mappings, showTutorial]);

  const handleTutorialComplete = useCallback(() => {
    if (tutorialPhase === 1) {
      try { localStorage.setItem('dwc-mapper-tutorial-seen', '1'); } catch {}
    } else {
      try { localStorage.setItem('dwc-mapper-tutorial-phase2-seen', '1'); } catch {}
    }
    setShowTutorial(false);
  }, [tutorialPhase]);

  const handleComplete = useCallback(() => {
    if (state.allRequiredMapped) {
      onComplete?.(state.mappings, state.selectedSchema);
    }
  }, [state.allRequiredMapped, state.mappings, state.selectedSchema, onComplete]);

  const toggleSchemaSelection = useCallback((schemaId: string) => {
    state.setSelectedForDownload(prev => {
      const next = new Set(prev);
      if (next.has(schemaId)) next.delete(schemaId);
      else next.add(schemaId);
      return next;
    });
  }, [state.setSelectedForDownload]);

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

      {/* ID Generator dialog */}
      <AnimatePresence>
        {state.showIdGenerator && (state.unmappedRequiredIdTerms.length > 0 || state.generatedIdConfigs.length > 0) && (
          <IdGeneratorDialog
            requiredIdTerms={[...new Set([...state.unmappedRequiredIdTerms, ...state.generatedIdConfigs.map(c => c.term)])]}
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
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Button onClick={onBack} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
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
                onClick={() => { setTutorialPhase(1); setShowTutorial(true); }}
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
            />
          </div>

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
