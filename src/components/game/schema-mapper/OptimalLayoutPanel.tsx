/**
 * @file OptimalLayoutPanel.tsx
 * @description Panel optymalnego układu tabel — wizualizuje wynik algorytmu set-cover.
 *
 * Pokazuje minimalną liczbę tabel DwC-DP pokrywających wszystkie zmapowane pola.
 * Każda karta pozwala przejść do odpowiedniego schematu kliknięciem.
 */

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minimize2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { schemaTypes, schemaTerms } from "./schemaData";
import type { OptimalLayoutItem } from "./useSchemaMapperState";

interface OptimalLayoutPanelProps {
  optimalLayout: OptimalLayoutItem[];
  mappingsCount: number;
  onSelectSchema: (schemaId: string) => void;
  onClearSearch: () => void;
}

export default function OptimalLayoutPanel({
  optimalLayout,
  mappingsCount,
  onSelectSchema,
  onClearSearch,
}: OptimalLayoutPanelProps) {
  const { t } = useLanguage();

  if (optimalLayout.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 }}
      className="mt-6"
    >
      <Card data-tour="optimal-layout" className="bg-card/90 border-border backdrop-blur">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <Minimize2 className="w-5 h-5 text-emerald-400" />
            {t('schema.optimalLayout')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('schema.optimalDescription', { fields: mappingsCount, tables: optimalLayout.length })}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {optimalLayout.map(({ schemaId, terms, required }) => {
              const info = schemaTypes.find(s => s.id === schemaId);
              const schema = schemaTerms[schemaId];
              const hasReqFields = schema && schema.required.length > 0;
              return (
                <div
                  key={schemaId}
                  className="p-3 rounded-xl border border-border bg-muted/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                  onClick={() => { onSelectSchema(schemaId); onClearSearch(); }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {info && (
                      <div className={`p-1 rounded ${info.color}`}>
                        <info.icon className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="font-semibold text-sm text-foreground">{info?.name || schemaId}</span>
                    <Badge className={`text-[10px] h-4 px-1 ${hasReqFields ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                      {hasReqFields ? `✓ ${t('schema.optimal')}` : t('schema.optionalTable')}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-auto">{terms.length} {t('schema.fieldsCount')}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {terms.slice(0, 8).map(term => (
                      <Badge key={term} variant="outline" className="text-[10px] text-muted-foreground border-border">
                        {term}
                      </Badge>
                    ))}
                    {terms.length > 8 && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                        +{terms.length - 8}
                      </Badge>
                    )}
                  </div>
                  {required.length > 0 && (
                    <p className="text-[10px] text-orange-400 mt-1.5">
                      ⚠ Brak wymaganych: {required.join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
