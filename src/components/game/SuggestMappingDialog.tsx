/**
 * @file SuggestMappingDialog.tsx
 * @description Popup dialog showing DwC term suggestions for user columns.
 * Shows definition, example, and sample data for each suggestion.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, X, Lightbulb, CheckSquare, Square } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { normalizeHeader, termAliases } from "./AutoMatchDialog";
import { OFFICIAL_DWC_TERMS, OFFICIAL_DWC_TERMS_SET } from "./officialDwCTerms";
import { dwcTerms } from "./DwCTerms";

export interface SuggestionItem {
  column: string;
  term: string;
  sample: string;
}

interface SuggestMappingDialogProps {
  suggestions: SuggestionItem[];
  onApply: (selected: SuggestionItem[]) => void;
  onDismiss: () => void;
}

/** Build suggestion list from columns + data */
export function buildSuggestions(
  columns: string[],
  data: any[],
  getColumnMapping: (col: string) => string | null,
): SuggestionItem[] {
  const results: SuggestionItem[] = [];
  for (const col of columns) {
    if (getColumnMapping(col)) continue;
    const colNorm = normalizeHeader(col);
    let match: string | null = null;
    const exact = OFFICIAL_DWC_TERMS.find((t) => normalizeHeader(t) === colNorm);
    if (exact) {
      match = exact;
    } else {
      for (const [term, aliases] of Object.entries(termAliases)) {
        if (!OFFICIAL_DWC_TERMS_SET.has(term)) continue;
        if ((aliases as string[]).some((a) => normalizeHeader(a) === colNorm)) {
          match = term;
          break;
        }
      }
    }
    if (match) {
      const sample = data
        .slice(0, 3)
        .map((r) => r[col])
        .filter(Boolean)
        .join(", ");
      results.push({ column: col, term: match, sample: sample || "—" });
    }
  }
  return results;
}

export default function SuggestMappingDialog({ suggestions, onApply, onDismiss }: SuggestMappingDialogProps) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<Set<number>>(() => new Set(suggestions.map((_, i) => i)));

  const allSelected = selected.size === suggestions.length;
  const noneSelected = selected.size === 0;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(suggestions.map((_, i) => i)));
  };

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const getDescription = (term: string) => {
    const info = dwcTerms[term];
    if (!info) return "";
    if (language === "en" && info.descriptionEN) return info.descriptionEN;
    if (language === "fr" && info.descriptionFR) return info.descriptionFR;
    if (language === "de" && info.descriptionDE) return info.descriptionDE;
    return info.description;
  };

  const getExample = (term: string) => {
    const info = dwcTerms[term];
    return info?.example || "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("suggestMapping.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("suggestMapping.found", { count: suggestions.length })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Select all / deselect all */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={toggleAll} className="gap-2">
            {allSelected ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            {allSelected ? t("autoMatch.deselectAll") : t("autoMatch.selectAll")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selected.size} / {suggestions.length} {t("autoMatch.selected", { count: selected.size })}
          </span>
        </div>

        {/* Suggestion list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {suggestions.map((item, idx) => {
            const desc = getDescription(item.term);
            const example = getExample(item.term);
            return (
              <div
                key={idx}
                onClick={() => toggle(idx)}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selected.has(idx) ? "border-amber-500/50 bg-amber-500/10" : "border-border bg-muted/30 opacity-60"}
                `}
              >
                <div className="flex items-start gap-3">
                  <Checkbox checked={selected.has(idx)} onCheckedChange={() => toggle(idx)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">{item.column}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono text-sm font-semibold text-amber-500">{item.term}</span>
                    </div>
                    {desc && <p className="text-xs text-muted-foreground mb-1">{desc}</p>}
                    {example && (
                      <p className="text-xs text-muted-foreground mb-1">
                        <span className="font-medium text-foreground/70">{t("suggestMapping.example")}:</span>{" "}
                        <code className="text-foreground/60">{example}</code>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">{t("autoMatch.sampleData")}:</span>{" "}
                      <code className="text-foreground/60">{item.sample}</code>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="ghost" onClick={onDismiss}>
            {t("autoMatch.skip")}
          </Button>
          <Button
            onClick={() => onApply(suggestions.filter((_, i) => selected.has(i)))}
            disabled={noneSelected}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white gap-2"
          >
            <Check className="w-4 h-4" />
            {t("suggestMapping.apply", { count: selected.size })}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
