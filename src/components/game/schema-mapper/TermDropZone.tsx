/**
 * @file TermDropZone.tsx
 * @description Komponent strefy upuszczania (drop zone) dla pojedynczego termu DwC.
 *
 * Obsługuje:
 * - Przeciąganie i upuszczanie kolumn (drag & drop)
 * - Przypisywanie kolumn kliknięciem (tap-to-assign na mobile)
 * - Wyświetlanie opisu termu w odpowiednim języku
 * - Wizualne rozróżnienie pól wymaganych vs opcjonalnych
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Target, MousePointerClick } from "lucide-react";
import { dwcTerms } from "../DwCTerms";
import { useLanguage } from "@/i18n/LanguageContext";

interface TermDropZoneProps {
  /** Nazwa termu DwC (np. "eventID") */
  termName: string;
  /** Zmapowana kolumna źródłowa (jeśli istnieje) */
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
}

export default function TermDropZone({
  termName,
  mappedColumn,
  isRequired,
  onDrop,
  onRemove,
  onTapAssign,
  hasSelectedColumn = false,
}: TermDropZoneProps) {
  const { t, language } = useLanguage();
  const [isOver, setIsOver] = useState(false);

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
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        p-3 md:p-4 rounded-xl border-2 transition-all min-h-[44px]
        ${isOver ? "border-purple-500 bg-purple-500/20 scale-[1.02]" : ""}
        ${hasSelectedColumn && !mappedColumn ? "border-indigo-400 bg-indigo-500/20 border-dashed animate-pulse cursor-pointer" : ""}
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
          </div>
          <p className="text-xs text-muted-foreground">{termDescription || term?.description || "Darwin Core term"}</p>
        </div>
        {hasSelectedColumn && !mappedColumn && (
          <MousePointerClick className="w-4 h-4 text-indigo-400 animate-bounce flex-shrink-0" />
        )}
        {mappedColumn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(termName);
            }}
            className="text-muted-foreground hover:text-red-400 h-6 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {mappedColumn ? (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-sm text-green-400 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {mappedColumn}
          </p>
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3" />
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
