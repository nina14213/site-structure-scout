import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, CheckSquare, Square } from 'lucide-react';
import { dwcTerms } from './DwCTerms';
import { useLanguage } from '@/i18n/LanguageContext';

interface AutoMatchResult {
  column: string;
  termName: string;
  schemaId: string;
  schemaName: string;
  sample: string;
  description: string;
}

interface AutoMatchDialogProps {
  matches: AutoMatchResult[];
  onApply: (selectedMatches: AutoMatchResult[]) => void;
  onDismiss: () => void;
}

export function findAutoMatches(
  columns: string[],
  data: any[],
  schemaTerms: Record<string, { required: string[]; optional: string[] }>,
  schemaTypes: { id: string; name: string }[],
  language: string
): AutoMatchResult[] {
  const results: AutoMatchResult[] = [];
  const matchedColumns = new Set<string>();
  const matchedTerms = new Set<string>();

  for (const col of columns) {
    const colLower = col.toLowerCase().replace(/[_\s-]/g, '');

    for (const [schemaId, schema] of Object.entries(schemaTerms)) {
      const allTerms = [...schema.required, ...schema.optional];
      for (const term of allTerms) {
        if (matchedTerms.has(`${schemaId}:${term}`)) continue;
        const termLower = term.toLowerCase();

        // Exact match (case-insensitive, ignoring separators)
        if (colLower === termLower) {
          const info = dwcTerms[term];
          const schemaInfo = schemaTypes.find(s => s.id === schemaId);
          const sample = data.slice(0, 3).map(r => r[col]).filter(Boolean).join(', ');
          const description = info
            ? (language === 'en' && info.descriptionEN) || 
              (language === 'fr' && info.descriptionFR) || 
              (language === 'de' && info.descriptionDE) || 
              info.description
            : term;

          results.push({
            column: col,
            termName: term,
            schemaId,
            schemaName: schemaInfo?.name || schemaId,
            sample: sample || '—',
            description: description || '',
          });

          matchedColumns.add(col);
          matchedTerms.add(`${schemaId}:${term}`);
          break; // one column -> first matching term across schemas
        }
      }
      if (matchedColumns.has(col)) break; // found match for this column
    }
  }

  return results;
}

export default function AutoMatchDialog({ matches, onApply, onDismiss }: AutoMatchDialogProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<number>>(() => new Set(matches.map((_, i) => i)));

  const allSelected = selected.size === matches.length;
  const noneSelected = selected.size === 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(matches.map((_, i) => i)));
    }
  };

  const toggle = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleApply = () => {
    const selectedMatches = matches.filter((_, i) => selected.has(i));
    onApply(selectedMatches);
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
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('autoMatch.title')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('autoMatch.found', { count: matches.length })}
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
            {allSelected ? t('autoMatch.deselectAll') : t('autoMatch.selectAll')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selected.size} / {matches.length} {t('autoMatch.selected')}
          </span>
        </div>

        {/* Match list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {matches.map((match, idx) => (
            <div
              key={idx}
              onClick={() => toggle(idx)}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selected.has(idx)
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-border bg-muted/30 opacity-60'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selected.has(idx)}
                  onCheckedChange={() => toggle(idx)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-foreground">{match.column}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-sm font-semibold text-emerald-500">{match.termName}</span>
                    <Badge variant="outline" className="text-xs">
                      {match.schemaName}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{match.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">{t('autoMatch.sampleData')}:</span>{' '}
                    <code className="text-foreground/60">{match.sample}</code>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="ghost" onClick={onDismiss}>
            {t('autoMatch.skip')}
          </Button>
          <Button
            onClick={handleApply}
            disabled={noneSelected}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white gap-2"
          >
            <Check className="w-4 h-4" />
            {t('autoMatch.apply', { count: selected.size })}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
