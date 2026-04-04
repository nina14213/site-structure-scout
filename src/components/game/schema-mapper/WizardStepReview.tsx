/**
 * @file WizardStepReview.tsx
 * @description Step 2 of the wizard — review optimal layout, configure ID generators and date conversion.
 */

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Key, CalendarClock, CheckCircle, Layers, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import OptimalLayoutPanel from "./OptimalLayoutPanel";
import type { OptimalLayoutItem, ClassifiedSchemas } from "./useSchemaMapperState";

interface WizardStepReviewProps {
  optimalLayout: OptimalLayoutItem[];
  mappingsCount: number;
  schemasWithMappingsCount: number;
  onSelectSchema: (schemaId: string) => void;
  onClearSearch: () => void;
  unmappedRequiredIdTerms: string[];
  onOpenIdGenerator: () => void;
  generatedIdConfigs: { term: string; mode: string }[];
  eventDateIsoSuggestion: { nonIsoCount: number; totalNonEmpty: number } | null;
  applyEventDateIsoSuggestion: () => void;
}

export default function WizardStepReview({
  optimalLayout,
  mappingsCount,
  onSelectSchema,
  onClearSearch,
  unmappedRequiredIdTerms,
  onOpenIdGenerator,
  generatedIdConfigs,
  eventDateIsoSuggestion,
  applyEventDateIsoSuggestion,
}: WizardStepReviewProps) {
  const { t } = useLanguage();

  const hasIdIssues = unmappedRequiredIdTerms.length > 0;
  const hasDateIssues = !!eventDateIsoSuggestion;
  const allGood = !hasIdIssues && !hasDateIssues;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      {/* Optimal layout */}
      <OptimalLayoutPanel
        optimalLayout={optimalLayout}
        mappingsCount={mappingsCount}
        onSelectSchema={onSelectSchema}
        onClearSearch={onClearSearch}
      />

      {/* Checklist */}
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
          {/* ID Generator */}
          {hasIdIssues && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">
                      {t("idGen.missingRequired", { count: unmappedRequiredIdTerms.length })}
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

          {/* Date conversion */}
          {hasDateIssues && eventDateIsoSuggestion && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      {t("schema.eventDateNotIso")}
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
            </div>
          )}

          {/* All good */}
          {allGood && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                {t("wizard.allGood")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
