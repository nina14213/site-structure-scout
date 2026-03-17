/**
 * @file IdGeneratorDialog.tsx
 * @description Dialog do generowania unikalnych identyfikatorów dla wymaganych pól ID w DwC-DP.
 * Obsługuje tryby: prefix-auto, UUID, from-columns, skip.
 * Używa Radix Dialog dla poprawnego renderowania jako pop-up.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Key, AlertTriangle, Check, SkipForward, Hash } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export type IdMode = 'prefix-auto' | 'uuid' | 'from-columns' | 'skip';

export interface IdFieldConfig {
  term: string;
  mode: IdMode;
  prefix: string;
  startNum: number;
  padding: number;
  separator: string;
  sourceColumns: string[];
}

interface IdGeneratorDialogProps {
  open: boolean;
  requiredIdTerms: string[];
  columns: string[];
  data: any[];
  existingMappings: Record<string, string>;
  existingConfigs?: IdFieldConfig[];
  onApply: (configs: IdFieldConfig[]) => void;
  onDismiss: () => void;
}

function generatePreviewValues(
  config: IdFieldConfig,
  data: any[],
  count: number
): string[] {
  const rows = data.slice(0, count);
  if (config.mode === 'skip') return Array(count).fill('—');
  if (config.mode === 'uuid') {
    return rows.map(() => crypto.randomUUID());
  }
  if (config.mode === 'prefix-auto') {
    return rows.map((_, i) => {
      const num = config.startNum + i;
      const padded = String(num).padStart(config.padding, '0');
      return `${config.prefix}${config.separator}${padded}`;
    });
  }
  if (config.mode === 'from-columns') {
    return rows.map((row, i) => {
      const parts = config.sourceColumns.map(col => String(row[col] ?? '').trim());
      const composed = parts.filter(Boolean).join(config.separator || '-');
      return composed || `row-${i + 1}`;
    });
  }
  return [];
}

function checkDuplicates(values: string[]): { hasDuplicates: boolean; duplicateCount: number } {
  const seen = new Set<string>();
  let duplicateCount = 0;
  for (const v of values) {
    if (v === '—') continue;
    if (seen.has(v)) duplicateCount++;
    seen.add(v);
  }
  return { hasDuplicates: duplicateCount > 0, duplicateCount };
}

export default function IdGeneratorDialog({
  open,
  requiredIdTerms,
  columns,
  data,
  existingMappings,
  existingConfigs,
  onApply,
  onDismiss,
}: IdGeneratorDialogProps) {
  const { t } = useLanguage();

  const [configs, setConfigs] = useState<IdFieldConfig[]>(() =>
    requiredIdTerms.map(term => {
      const existing = existingConfigs?.find(c => c.term === term);
      if (existing) return existing;
      return {
        term,
        mode: 'prefix-auto' as IdMode,
        prefix: term.replace(/ID$/i, '').toUpperCase(),
        startNum: 1,
        padding: Math.max(3, String(data.length).length),
        separator: '-',
        sourceColumns: [],
      };
    })
  );

  const updateConfig = useCallback((index: number, updates: Partial<IdFieldConfig>) => {
    setConfigs(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  }, []);

  const validationResults = useMemo(() => {
    return configs.map(config => {
      if (config.mode === 'skip') return { hasDuplicates: false, duplicateCount: 0 };
      const existingCol = existingMappings[config.term];
      if (existingCol) {
        const vals = data.map(row => String(row[existingCol] ?? '').trim()).filter(Boolean);
        return checkDuplicates(vals);
      }
      const allValues = generatePreviewValues(config, data, data.length);
      return checkDuplicates(allValues);
    });
  }, [configs, data, existingMappings]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onDismiss(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Key className="w-5 h-5 text-primary" />
            </div>
            {t('idGen.title')}
          </DialogTitle>
          <DialogDescription>{t('idGen.subtitle')}</DialogDescription>
        </DialogHeader>

        {/* Fields */}
        <div className="space-y-4 py-2">
          {configs.map((config, idx) => {
            const validation = validationResults[idx];
            const previews = generatePreviewValues(config, data, 3);
            const isAlreadyMapped = !!existingMappings[config.term];

            return (
              <div
                key={config.term}
                className={`p-4 rounded-xl border transition-colors ${
                  config.mode === 'skip'
                    ? 'border-muted bg-muted/20 opacity-60'
                    : validation.hasDuplicates
                      ? 'border-destructive/50 bg-destructive/5'
                      : 'border-border bg-muted/30'
                }`}
              >
                {/* Term header */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Hash className="w-4 h-4 text-primary" />
                  <span className="font-mono font-semibold text-foreground">{config.term}</span>
                  <Badge variant="destructive" className="text-[10px] h-4 px-1">{t('common.required')}</Badge>
                  {isAlreadyMapped && (
                    <Badge className="text-[10px] h-4 px-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      {t('idGen.alreadyMapped')}: {existingMappings[config.term]}
                    </Badge>
                  )}
                </div>

                {/* Mode selector */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {(['prefix-auto', 'uuid', 'from-columns', 'skip'] as IdMode[]).map(mode => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={config.mode === mode ? 'default' : 'outline'}
                      onClick={() => updateConfig(idx, { mode })}
                      className="text-xs"
                    >
                      {mode === 'prefix-auto' && `🔢 ${t('idGen.prefixAuto')}`}
                      {mode === 'uuid' && `🆔 UUID`}
                      {mode === 'from-columns' && `📋 ${t('idGen.fromColumns')}`}
                      {mode === 'skip' && <><SkipForward className="w-3 h-3 mr-1" />{t('idGen.skip')}</>}
                    </Button>
                  ))}
                </div>

                {/* Mode-specific controls */}
                {config.mode === 'prefix-auto' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('idGen.prefix')}</label>
                      <Input
                        value={config.prefix}
                        onChange={(e) => updateConfig(idx, { prefix: e.target.value })}
                        className="h-8 text-sm mt-1"
                        placeholder="EVT"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('idGen.separator')}</label>
                      <Select value={config.separator} onValueChange={(v) => updateConfig(idx, { separator: v })}>
                        <SelectTrigger className="h-8 text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">- (myślnik)</SelectItem>
                          <SelectItem value="_">_ (podkreślenie)</SelectItem>
                          <SelectItem value=":">: (dwukropek)</SelectItem>
                          <SelectItem value="">brak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('idGen.startNum')}</label>
                      <Input
                        type="number"
                        value={config.startNum}
                        onChange={(e) => updateConfig(idx, { startNum: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="h-8 text-sm mt-1"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('idGen.padding')}</label>
                      <Input
                        type="number"
                        value={config.padding}
                        onChange={(e) => updateConfig(idx, { padding: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="h-8 text-sm mt-1"
                        min={1}
                        max={10}
                      />
                    </div>
                  </div>
                )}

                {config.mode === 'from-columns' && (
                  <div className="mb-3">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                      {t('idGen.selectColumns')}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {columns.map(col => {
                        const isSelected = config.sourceColumns.includes(col);
                        return (
                          <Badge
                            key={col}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer text-xs transition-colors ${
                              isSelected ? '' : 'text-muted-foreground hover:text-foreground hover:border-primary/50'
                            }`}
                            onClick={() => {
                              const newCols = isSelected
                                ? config.sourceColumns.filter(c => c !== col)
                                : [...config.sourceColumns, col];
                              updateConfig(idx, { sourceColumns: newCols });
                            }}
                          >
                            {col}
                          </Badge>
                        );
                      })}
                    </div>
                    {config.sourceColumns.length > 0 && (
                      <div className="mt-2">
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('idGen.separator')}</label>
                        <Input
                          value={config.separator}
                          onChange={(e) => updateConfig(idx, { separator: e.target.value })}
                          className="h-8 text-sm mt-1 w-32"
                          placeholder="-"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Preview */}
                {config.mode !== 'skip' && (
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t('idGen.preview')}</p>
                    <div className="flex gap-2 flex-wrap">
                      {previews.map((v, i) => (
                        <code key={i} className="text-xs bg-background px-2 py-0.5 rounded text-foreground font-mono">
                          {v}
                        </code>
                      ))}
                      {data.length > 3 && (
                        <span className="text-xs text-muted-foreground">… +{data.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Duplicate warning */}
                {validation.hasDuplicates && config.mode !== 'skip' && (
                  <div className="flex items-center gap-2 mt-2 text-destructive text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{t('idGen.duplicateWarning', { count: String(validation.duplicateCount) })}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {configs.filter(c => c.mode !== 'skip').length} / {configs.length} {t('idGen.fieldsToGenerate')}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onDismiss}>
              {t('idGen.cancel')}
            </Button>
            <Button
              onClick={() => onApply(configs)}
              disabled={validationResults.some((v, i) => v.hasDuplicates && configs[i].mode !== 'skip')}
            >
              <Check className="w-4 h-4 mr-1.5" />
              {t('idGen.apply')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Utility: generate all ID values for export */
export function generateAllIds(
  config: IdFieldConfig,
  data: any[],
): string[] {
  return generatePreviewValues(config, data, data.length);
}
