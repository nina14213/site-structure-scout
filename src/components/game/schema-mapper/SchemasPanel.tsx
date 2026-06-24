/**
 * @file SchemasPanel.tsx
 * @description Panel prawej strony — wyświetla wszystkie schematy DwC-DP z ich termami.
 *
 * Funkcje:
 * - Wyszukiwanie cross-schema (po nazwie termu i opisie)
 * - Sortowanie: schematy z mapowaniami na górze, potem optymalne, potem reszta
 * - Składanie/rozkładanie schematów (details/summary)
 * - Badge'e statusu: optymalna / opcjonalna / ilość zmapowanych
 * - Przyciski: auto-map, reset, detekcja nagłówków
 * - Odrzucanie i przywracanie schematów
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers, Search as SearchIcon, X, ChevronDown, Sparkles, Lightbulb,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { dwcTerms } from "../DwCTerms";
import { schemaTerms, schemaTypes } from "./schemaData";
import TermDropZone from "./TermDropZone";
import type { OptimalLayoutItem, ClassifiedSchemas } from "./useSchemaMapperState";

/** Sprawdza czy term pasuje do zapytania wyszukiwania */
function matchesTermSearch(term: string, q: string): boolean {
  if (term.toLowerCase().includes(q)) return true;
  const info = dwcTerms[term];
  if (!info) return false;
  return [info.description, info.descriptionEN, info.descriptionFR, info.descriptionDE, info.category]
    .filter(Boolean)
    .some((text) => text!.toLowerCase().includes(q));
}

interface SchemasPanelProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  mappings: Record<string, string>;
  selectedColumn: string | null;
  schemasWithMappings: string[];
  optimalLayout: OptimalLayoutItem[];
  dismissedSchemas: Set<string>;
  onDismissSchema: (fn: (prev: Set<string>) => Set<string>) => void;
  columns: string[];
  onDrop: (e: React.DragEvent, termName: string) => void;
  onRemoveMapping: (term: string) => void;
  onTapAssignTerm: (term: string) => void;
  onAutoMap: () => void;
  onReset: () => void;
  onDetectHeaders: () => void;
  updateMappings: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  findBestColumnMatch: (term: string) => string | undefined;
  generatedIdConfigs: { term: string; mode: string }[];
  classifiedSchemas: ClassifiedSchemas;
  forcedSchemas: Set<string>;
  onToggleForceSchema: (schemaId: string) => void;
  onSuggestMapping?: () => void;
  suggestionsCount?: number;
}

export default function SchemasPanel({
  searchTerm,
  onSearchChange,
  mappings,
  selectedColumn,
  schemasWithMappings,
  optimalLayout,
  dismissedSchemas,
  onDismissSchema,
  columns,
  onDrop,
  onRemoveMapping,
  onTapAssignTerm,
  onAutoMap,
  onReset,
  onDetectHeaders,
  updateMappings,
  findBestColumnMatch,
  generatedIdConfigs,
  classifiedSchemas,
  forcedSchemas,
  onToggleForceSchema,
  onSuggestMapping,
  suggestionsCount = 0,
}: SchemasPanelProps) {
  const { t } = useLanguage();

  /** Filtrowane schematy wg wyszukiwania */
  const allSchemasFiltered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const results: { schemaId: string; schemaName: string; required: string[]; optional: string[] }[] = [];
    for (const [schemaId, schema] of Object.entries(schemaTerms)) {
      const schemaInfo = schemaTypes.find(s => s.id === schemaId);
      const schemaName = schemaInfo?.name || schemaId;
      const filteredReq = q ? schema.required.filter(t => matchesTermSearch(t, q)) : schema.required;
      const filteredOpt = q ? schema.optional.filter(t => matchesTermSearch(t, q)) : schema.optional;
      if (filteredReq.length > 0 || filteredOpt.length > 0) {
        results.push({ schemaId, schemaName, required: filteredReq, optional: filteredOpt });
      }
    }
    return results;
  }, [searchTerm]);

  const optimalIds = new Set(optimalLayout.map(o => o.schemaId));
  const mappedIds = new Set(schemasWithMappings);
  const optimalSet = new Set(classifiedSchemas.optimal);
  const optionalSet = new Set(classifiedSchemas.optional);

  /** Sortowanie schematów: optymalne → opcjonalne → inne (z mapowaniami na górze) */
  const sorted = useMemo(() => {
    return [...allSchemasFiltered].sort((a, b) => {
      const aOptimal = optimalSet.has(a.schemaId);
      const bOptimal = optimalSet.has(b.schemaId);
      const aOptional = optionalSet.has(a.schemaId);
      const bOptional = optionalSet.has(b.schemaId);
      const aHasMappings = mappedIds.has(a.schemaId);
      const bHasMappings = mappedIds.has(b.schemaId);

      // Tier 1: optimal first
      if (aOptimal !== bOptimal) return aOptimal ? -1 : 1;
      // Tier 2: optional (classified) second
      if (aOptional !== bOptional) return aOptional ? -1 : 1;
      // Tier 3: has any mappings
      if (aHasMappings !== bHasMappings) return aHasMappings ? -1 : 1;
      // Tier 4: by mapped count
      const aMapped = [...a.required, ...a.optional].filter(t => mappings[t]).length;
      const bMapped = [...b.required, ...b.optional].filter(t => mappings[t]).length;
      return bMapped - aMapped;
    });
  }, [allSchemasFiltered, mappings, mappedIds, optimalSet, optionalSet]);

  const dismissed = sorted.filter(s => dismissedSchemas.has(s.schemaId));
  const visible = sorted.filter(s => !dismissedSchemas.has(s.schemaId));

  /** Sprawdza czy istnieją schematy opcjonalne z brakującymi polami wymaganymi */
  const hasOptionalSchemas = allSchemasFiltered.some(({ schemaId }) => {
    const fullSchema = schemaTerms[schemaId];
    if (!fullSchema) return false;
    const missing = fullSchema.required.filter(t => !mappings[t]);
    if (missing.length === 0) return false;
    return missing.every(reqTerm =>
      Object.entries(schemaTerms).some(([otherId, otherSchema]) => {
        if (otherId === schemaId) return false;
        return (otherSchema.required.includes(reqTerm) || otherSchema.optional.includes(reqTerm)) && mappings[reqTerm];
      })
    );
  });

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card data-tour="schemas-panel" className="bg-card/90 border-border backdrop-blur h-full flex flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Wszystkie schematy DwC-DP
            <Badge variant="secondary" className="ml-auto text-xs">
              {Object.keys(schemaTerms).length} schematów
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 flex flex-col">
          {/* Search */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label={t("schema.searchFields")}
              placeholder={`${t("schema.searchFields")} (${t("schema.allSchemas") || "all schemas"})…`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
                aria-label="Wyczysc wyszukiwanie"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-muted-foreground"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </Button>
            )}
          </div>

          {/* Map all optional button */}
          {hasOptionalSchemas && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mb-3 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs"
              onClick={() => {
                updateMappings((prev) => {
                  const newMappings = { ...prev };
                  for (const [schemaId, schema] of Object.entries(schemaTerms)) {
                    const missing = schema.required.filter(t => !newMappings[t]);
                    if (missing.length === 0) continue;
                    const isOpt = missing.every(reqTerm =>
                      Object.entries(schemaTerms).some(([otherId, otherSchema]) => {
                        if (otherId === schemaId) return false;
                        return (otherSchema.required.includes(reqTerm) || otherSchema.optional.includes(reqTerm)) && newMappings[reqTerm];
                      })
                    );
                    if (!isOpt) continue;
                    [...schema.required, ...schema.optional].forEach((term) => {
                      if (!newMappings[term]) {
                        const match = findBestColumnMatch(term);
                        if (match) newMappings[term] = match;
                      }
                    });
                  }
                  return newMappings;
                });
              }}
            >
              ⚡ Mapuj wszystkie opcjonalne
            </Button>
          )}

          {/* Schema list */}
          <div className="flex-1 max-h-[40vh] md:max-h-[50vh] overflow-y-auto space-y-4">
            {allSchemasFiltered.length > 0 ? (
              <>
                {visible.map(({ schemaId, schemaName, required: req, optional: opt }) => {
                  const info = schemaTypes.find(s => s.id === schemaId);
                  const isOptimal = optimalIds.has(schemaId);
                  const hasMappings = mappedIds.has(schemaId);
                  const mappedCount = [...req, ...opt].filter(t => mappings[t]).length;
                  const totalVisible = req.length + opt.length;
                  const fullSchema = schemaTerms[schemaId];
                  const missingRequired = fullSchema?.required.filter(t => !mappings[t]) || [];
                  const allRequiredSatisfied = missingRequired.length === 0;
                  const isOptionalSchema = !allRequiredSatisfied && missingRequired.length > 0 && missingRequired.every(reqTerm =>
                    Object.entries(schemaTerms).some(([otherId, otherSchema]) => {
                      if (otherId === schemaId) return false;
                      return (otherSchema.required.includes(reqTerm) || otherSchema.optional.includes(reqTerm)) && mappings[reqTerm];
                    })
                  );
                  const shouldBeOpen = !hasMappings && (searchTerm.length > 0 && totalVisible <= 15);
                  const isForced = forcedSchemas.has(schemaId);
                  const hasOnlyIdMappings = mappedCount > 0 && [...req, ...opt].filter(t => mappings[t]).every(t => t.toLowerCase().endsWith('id'));
                  const hasMissingIdTerms = fullSchema?.required.some(t => t.toLowerCase().endsWith('id') && !mappings[t]);

                  return (
                    <details
                      key={schemaId}
                      open={shouldBeOpen}
                      className={`rounded-xl border transition-colors ${
                        isForced ? 'border-primary/50 bg-primary/5' :
                        isOptimal ? 'border-emerald-500/50 bg-emerald-500/5' :
                        hasMappings ? 'border-green-500/30 bg-green-500/5' :
                        isOptionalSchema ? 'border-amber-500/30 bg-amber-500/5' :
                        'border-border bg-muted/20'
                      }`}
                    >
                      <summary className="flex items-center gap-2 p-3 cursor-pointer select-none hover:bg-muted/30 rounded-xl">
                        {info && (
                          <div className={`p-1 rounded ${info.color} flex-shrink-0`}>
                            <info.icon className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <span
                          className={`font-semibold text-sm flex-1 ${isForced ? 'text-primary' : 'text-foreground'}`}
                          onClick={(e) => {
                            if (hasMissingIdTerms) {
                              e.preventDefault();
                              e.stopPropagation();
                              onToggleForceSchema(schemaId);
                            }
                          }}
                          title={hasMissingIdTerms ? (isForced ? 'Kliknij aby wyłączyć z eksportu ID' : 'Kliknij aby włączyć do eksportu ID') : undefined}
                        >
                          {schemaName}
                          {isForced && ' 📌'}
                        </span>
                        {isOptionalSchema && (
                          <>
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] h-4 px-1">
                              opcjonalna
                            </Badge>
                            <button
                              type="button"
                              aria-label={`Mapuj opcjonalny schemat ${schemaName}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateMappings((prev) => {
                                  const newMappings = { ...prev };
                                  const allTerms = [...fullSchema.required, ...fullSchema.optional];
                                  allTerms.forEach((term) => {
                                    if (!newMappings[term]) {
                                      const match = findBestColumnMatch(term);
                                      if (match) newMappings[term] = match;
                                    }
                                  });
                                  return newMappings;
                                });
                              }}
                              className="text-[10px] h-4 px-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/40 hover:text-amber-200 transition-colors"
                            >
                              ⚡ Mapuj
                            </button>
                          </>
                        )}
                        {mappedCount > 0 && !isOptionalSchema && (
                          (() => {
                            const hasReqFields = fullSchema && fullSchema.required.length > 0;
                            const allReqMapped = !hasReqFields || fullSchema.required.every(t => mappings[t]);
                            const showOptimal = isOptimal && allReqMapped;
                            return (
                              <Badge
                                className={`${showOptimal
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                } text-[10px] h-4 px-1 cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors`}
                                title={t('schema.dismissSchema')}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismissSchema(prev => new Set([...prev, schemaId])); }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDismissSchema(prev => new Set([...prev, schemaId]));
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`${t('schema.dismissSchema')}: ${schemaName}`}
                              >
                                {showOptimal ? `✓ ${t('schema.optimal')}` : t('schema.optionalTable')} ✕
                              </Badge>
                            );
                          })()
                        )}
                        {mappedCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            {mappedCount} zmapowanych
                          </Badge>
                        )}
                        {hasMappings && (
                          <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                        )}
                        <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground">
                          {req.length}+{opt.length}
                        </Badge>
                      </summary>
                      <div className="px-3 pb-3 space-y-2">
                        {isOptionalSchema && (
                          <p className="text-[10px] text-amber-400 mb-1">
                            ℹ Wymagane pola ({missingRequired.join(', ')}) są już zmapowane w innych tabelach. Kliknij „⚡ Mapuj" aby automapować.
                          </p>
                        )}
                        {req.length > 0 && (
                          <div>
                            <p className="text-[10px] text-orange-400 font-semibold mb-1 uppercase tracking-wider">Wymagane</p>
                            {req.map(term => (
                              <TermDropZone
                                key={`${schemaId}-${term}`}
                                termName={term}
                                mappedColumn={mappings[term]}
                                isRequired={true}
                                onDrop={onDrop}
                                onRemove={onRemoveMapping}
                                onTapAssign={onTapAssignTerm}
                                hasSelectedColumn={!!selectedColumn}
                                onUpdateMapping={(term, val) => updateMappings(prev => ({ ...prev, [term]: val }))}
                              />
                            ))}
                          </div>
                        )}
                        {opt.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Opcjonalne ({opt.length})</p>
                            {[...opt].sort((a, b) => {
                              const aMapped = mappings[a] ? 0 : 1;
                              const bMapped = mappings[b] ? 0 : 1;
                              return aMapped - bMapped;
                            }).map(term => (
                              <TermDropZone
                                key={`${schemaId}-${term}`}
                                termName={term}
                                mappedColumn={mappings[term]}
                                isRequired={false}
                                onDrop={onDrop}
                                onRemove={onRemoveMapping}
                                onTapAssign={onTapAssignTerm}
                                hasSelectedColumn={!!selectedColumn}
                                onUpdateMapping={(term, val) => updateMappings(prev => ({ ...prev, [term]: val }))}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
                {dismissed.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground mb-1">{t('schema.dismissed')} ({dismissed.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {dismissed.map(({ schemaId, schemaName }) => (
                        <Badge
                          key={schemaId}
                          variant="outline"
                          className="text-[10px] h-5 px-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:border-emerald-500/50 transition-colors"
                          onClick={() => onDismissSchema(prev => { const next = new Set(prev); next.delete(schemaId); return next; })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onDismissSchema(prev => { const next = new Set(prev); next.delete(schemaId); return next; });
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Przywroc schemat ${schemaName}`}
                        >
                          + {schemaName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {searchTerm && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    {allSchemasFiltered.reduce((sum, s) => sum + s.required.length + s.optional.length, 0)} wyników w {allSchemasFiltered.length} schematach
                  </p>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Brak wyników dla „{searchTerm}"
              </div>
            )}
          </div>

          {/* Actions */}
          <div data-tour="auto-map-btn" className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
            <div className="flex gap-3">
              <Button
                data-demo-id="detect-headers"
                onClick={onDetectHeaders}
                variant="outline"
                className="flex-1 border-cyan-500/40 text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
              >
                <Sparkles className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {t("schema.detectHeaders")}
              </Button>
              <Button onClick={onReset} variant="ghost" className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4 mr-1" aria-hidden="true" />
                {t("schema.reset")}
              </Button>
            </div>
            {onSuggestMapping && (
              <Button
                data-tour="suggest-mapping-btn"
                variant="outline"
                size="sm"
                onClick={onSuggestMapping}
                className={`w-full gap-2 ${suggestionsCount > 0 ? 'text-amber-500 border-amber-500/50 hover:bg-amber-500/10' : 'text-muted-foreground border-border hover:bg-muted/50'}`}
              >
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
                {t("schema.suggestMapping")} ({suggestionsCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
