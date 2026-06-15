/**
 * @file TermDropZone.tsx
 * @description Komponent strefy upuszczania (drop zone) dla pojedynczego termu DwC.
 *
 * Obsługuje:
 * - Przeciąganie i upuszczanie kolumn (drag & drop)
 * - Przypisywanie kolumn kliknięciem (tap-to-assign na mobile)
 * - Wyświetlanie opisu termu w odpowiednim języku
 * - Wizualne rozróżnienie pól wymaganych vs opcjonalnych
 * - Mapowanie wielu kolumn (pipe join) z możliwością usuwania i zmiany kolejności
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Target, MousePointerClick, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { dwcTerms } from "../DwCTerms";
import { useLanguage } from "@/i18n/LanguageContext";

interface TermDropZoneProps {
  /** Nazwa termu DwC (np. "eventID") */
  termName: string;
  /** Zmapowana kolumna źródłowa (jeśli istnieje) — może być pipe-separated */
  mappedColumn?: string;
  /** Czy pole jest wymagane w schemacie */
  isRequired: boolean;
  /** Handler zdarzenia drop */
  onDrop: (e: React.DragEvent, termName: string) => void;
  /** Handler usunięcia mapowania */
  onRemove: (termName: string) => void;
  /** Handler przypisania kolumny kliknięciem (mobile) */
  onTapAssign?: (termName: string) => void;
  /** Czy jakaś kolumna jest aktualnie zaznaczona */
  hasSelectedColumn?: boolean;
  /** Handler aktualizacji mapowań (do reorderu / usuwania pojedynczej kolumny) */
  onUpdateMapping?: (termName: string, newValue: string) => void;
}

export default function TermDropZone({
  termName,
  mappedColumn,
  isRequired,
  onDrop,
  onRemove,
  onTapAssign,
  hasSelectedColumn = false,
  onUpdateMapping,
}: TermDropZoneProps) {
  const { t, language } = useLanguage();
  const [isOver, setIsOver] = useState(false);

  // Parse pipe-separated columns
  const mappedColumns = mappedColumn ? mappedColumn.split(' | ') : [];
  const isMultiColumn = mappedColumns.length > 1;

  // Pobierz opis termu w odpowiednim języku
  const term = dwcTerms[termName];
  const termDescription = term
    ? language === "fr" && term.descriptionFR
      ? term.descriptionFR
      : language === "de" && term.descriptionDE
        ? term.descriptionDE
        : language === "en" && term.descriptionEN
          ? term.descriptionEN
          : term.description
    : null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, termName);
  };

  const handleClick = () => {
    if (hasSelectedColumn && !mappedColumn) {
      onTapAssign?.(termName);
    } else if (hasSelectedColumn && mappedColumn) {
      // Allow adding more columns via tap when already mapped
      onTapAssign?.(termName);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === "Enter" || event.key === " ") && hasSelectedColumn) {
      event.preventDefault();
      onTapAssign?.(termName);
    }
  };

  const removeColumn = (idx: number) => {
    if (mappedColumns.length === 1) {
      onRemove(termName);
    } else {
      const updated = mappedColumns.filter((_, i) => i !== idx).join(' | ');
      onUpdateMapping?.(termName, updated);
    }
  };

  const moveColumn = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= mappedColumns.length) return;
    const arr = [...mappedColumns];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onUpdateMapping?.(termName, arr.join(' | '));
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={hasSelectedColumn ? "button" : "group"}
      tabIndex={hasSelectedColumn ? 0 : undefined}
      aria-label={`${termName}. ${isRequired ? t("schema.required") : "opcjonalne"}${mappedColumn ? `, zmapowane do ${mappedColumn}` : ", bez mapowania"}.`}
      className={`
        p-3 md:p-4 rounded-xl border-2 transition-all min-h-[44px]
        ${isOver ? "border-purple-500 bg-purple-500/20 scale-[1.02]" : ""}
        ${hasSelectedColumn && !mappedColumn ? "border-indigo-400 bg-indigo-500/20 border-dashed animate-pulse cursor-pointer" : ""}
        ${hasSelectedColumn && mappedColumn ? "border-indigo-400/50 bg-indigo-500/10 cursor-pointer" : ""}
        ${
          !isOver && !hasSelectedColumn && mappedColumn
            ? "border-green-500/50 bg-green-500/10"
            : !isOver && !hasSelectedColumn && !mappedColumn
              ? isRequired
                ? "border-dashed border-orange-500/50 bg-orange-500/5"
                : "border-dashed border-border bg-muted/30"
              : ""
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-sm font-semibold text-foreground">{termName}</span>
            {isRequired && <Badge className="bg-orange-500/80 text-white text-xs">{t("schema.required")}</Badge>}
            {term?.category && (
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 text-xs">
                {term.category === "core" ? "Core IDs" : term.category}
              </Badge>
            )}
            {isMultiColumn && (
              <Badge variant="outline" className="text-purple-400 border-purple-500/50 text-[10px]">
                {mappedColumns.length} cols → pipe
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{termDescription || term?.description || "Darwin Core term"}</p>
        </div>
        {hasSelectedColumn && !mappedColumn && (
          <MousePointerClick className="w-4 h-4 text-indigo-400 animate-bounce flex-shrink-0" aria-hidden="true" />
        )}
        {mappedColumn && !isMultiColumn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(termName);
            }}
            aria-label={`${t("common.remove")}: ${termName}`}
            className="text-muted-foreground hover:text-red-400 h-6 px-2"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </Button>
        )}
      </div>

      {mappedColumn ? (
        <div className="mt-2 pt-2 border-t border-border/50">
          {isMultiColumn ? (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground mb-1">{t('schema.columnsJoined')}</p>
              {mappedColumns.map((col, idx) => (
                <div key={`${col}-${idx}`} className="flex items-center gap-1 group">
                  <span className="text-[10px] text-muted-foreground w-4 text-right">{idx + 1}.</span>
                  <span className="text-sm text-green-400 flex-1">{col}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); moveColumn(idx, -1); }}
                      disabled={idx === 0}
                      aria-label={`Przenies ${col} wyzej`}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowUp className="w-3 h-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); moveColumn(idx, 1); }}
                      disabled={idx === mappedColumns.length - 1}
                      aria-label={`Przenies ${col} nizej`}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowDown className="w-3 h-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); removeColumn(idx); }}
                      aria-label={`${t("common.remove")}: ${col}`}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-red-400"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </Button>
                  </div>
                  {idx < mappedColumns.length - 1 && (
                    <span className="text-[10px] text-purple-400 font-mono">|</span>
                  )}
                </div>
              ))}
              {hasSelectedColumn && (
                <p className="text-[10px] text-indigo-400 mt-1">+ {t('schema.addMoreColumns')}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" aria-hidden="true" />
              {mappedColumn}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3" aria-hidden="true" />
            {t("schema.dragHere")}
          </p>
          {term?.example && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("schema.examplePrefix")} <code className="text-foreground/70">{term.example}</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
