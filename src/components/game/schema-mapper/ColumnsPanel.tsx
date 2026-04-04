/**
 * @file ColumnsPanel.tsx
 * @description Panel lewej strony — wyświetla kolumny źródłowe użytkownika.
 *
 * Funkcje:
 * - Pokazuje wszystkie kolumny z pliku CSV/XLSX
 * - Obsługuje drag & drop oraz tap-to-select (mobile)
 * - Wyświetla próbki wartości i istniejące mapowania
 * - Pozwala usuwać mapowania kliknięciem w badge
 */

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileSpreadsheet, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { isMultiMapColumn } from "./useSchemaMapperState";

interface ColumnsPanelProps {
  columns: string[];
  dataRowCount: number;
  mappedColumnsCount: number;
  selectedColumn: string | null;
  draggedColumn: string | null;
  onTapSelectColumn: (col: string) => void;
  onDragStart: (e: React.DragEvent, col: string) => void;
  onDragEnd: () => void;
  onClearSelectedColumn: () => void;
  getColumnMapping: (col: string) => string | null;
  getAllColumnMappings: (col: string) => string[];
  getSampleValues: (col: string) => string;
  onRemoveMapping: (term: string) => void;
}

export default function ColumnsPanel({
  columns,
  dataRowCount,
  mappedColumnsCount,
  selectedColumn,
  draggedColumn,
  onTapSelectColumn,
  onDragStart,
  onDragEnd,
  onClearSelectedColumn,
  getColumnMapping,
  getAllColumnMappings,
  getSampleValues,
  onRemoveMapping,
}: ColumnsPanelProps) {
  const { t } = useLanguage();

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
      <Card data-tour="columns-panel" className="bg-card/90 border-border backdrop-blur h-full">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-card-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
              {t("schema.yourColumns")} ({columns.length})
            </span>
            <Badge variant="secondary">
              {dataRowCount} {t("schema.rows")}
            </Badge>
          </CardTitle>
          {/* Mapping progress bar */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("wizard.mappedColumns", { mapped: mappedColumnsCount, total: columns.length })}</span>
              <span className="font-mono">{Math.round((mappedColumnsCount / columns.length) * 100)}%</span>
            </div>
            <Progress value={(mappedColumnsCount / columns.length) * 100} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto space-y-2">
          {/* Mobile hint */}
          <p className="text-xs text-muted-foreground md:hidden mb-2 flex items-center gap-1">
            👆 {t("core.tapToSelect")}
          </p>
          {/* Selected column banner (mobile) */}
          {selectedColumn && (
            <div className="md:hidden p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/50 text-indigo-200 text-sm flex items-center gap-2 mb-2">
              <span>👆</span>
              {t("core.selectedColumn", { column: selectedColumn })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClearSelectedColumn()}
                className="ml-auto h-5 px-1 text-indigo-300"
              >
                ✕
              </Button>
            </div>
          )}
          {columns.map((column, idx) => {
            const mappedTo = getColumnMapping(column);
            const allMappedTo = getAllColumnMappings(column);
            const isSelected = selectedColumn === column;
            const isIdColumn = isMultiMapColumn(column);
             const isPipeJoined = allMappedTo.some(term => {
               const val = mappings?.[term];
               return val && val.includes(' | ');
             });
             return (
              <motion.div
                key={column}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, column)}
                  onDragEnd={onDragEnd}
                  onClick={() => onTapSelectColumn(column)}
                  className={`
                    p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all
                    md:cursor-grab cursor-pointer
                    ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-400/50"
                        : mappedTo
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-border bg-muted/50 hover:border-purple-500/50"
                    }
                    ${draggedColumn === column ? "opacity-50 scale-95" : ""}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-muted-foreground md:hidden flex-shrink-0" />
                      <span className="font-semibold text-foreground">{column}</span>
                      {isIdColumn && allMappedTo.length > 1 && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          ×{allMappedTo.length}
                        </Badge>
                      )}
                    </div>
                    {isSelected && <MousePointerClick className="w-4 h-4 text-indigo-400 animate-pulse" />}
                    {allMappedTo.length > 0 && !isSelected && (
                      <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                        {allMappedTo.slice(0, 5).map(term => (
                          <Badge
                            key={term}
                            variant="outline"
                            className="text-green-400 border-green-500/50 text-[10px] px-1 cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveMapping(term);
                            }}
                            title={`Kliknij aby usunąć mapowanie → ${term}`}
                          >
                            → {term} ✕
                          </Badge>
                        ))}
                        {allMappedTo.length > 5 && (
                          <Badge variant="outline" className="text-green-400 border-green-500/50 text-[10px] px-1">
                            +{allMappedTo.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {t("schema.samplePrefix")} {getSampleValues(column) || "—"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
