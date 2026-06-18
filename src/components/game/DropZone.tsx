import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Check, X, Link as LinkIcon, MousePointerClick } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { dwcTerms, termCategories } from './DwCTerms';
import { useLanguage } from '@/i18n/LanguageContext';

interface DropZoneProps {
    termName: string;
    mappedColumn: string | null;
    isRequired: boolean;
    isValid: boolean;
    onDrop?: (termName: string, columnName: string) => void;
    onRemove?: (termName: string) => void;
    onTapAssign?: (termName: string) => void;
    category?: string;
    hasSelectedColumn?: boolean;
}

export default function DropZone({
    termName,
    mappedColumn,
    isRequired,
    isValid,
    onDrop,
    onRemove,
    onTapAssign,
    category = 'core',
    hasSelectedColumn = false,
}: DropZoneProps) {
    const [isOver, setIsOver] = useState(false);
    const { t, language } = useLanguage();
    const pick = (pl: string, en: string, fr: string, de: string) => {
        if (language === 'en') return en;
        if (language === 'fr') return fr;
        if (language === 'de') return de;
        return pl;
    };
    const term = dwcTerms[termName];
    const categoryInfo = termCategories[category];

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
        const columnName = e.dataTransfer.getData('text/plain');
        onDrop?.(termName, columnName);
    };

    const handleClick = () => {
        if (hasSelectedColumn && !mappedColumn) {
            onTapAssign?.(termName);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if ((event.key === 'Enter' || event.key === ' ') && hasSelectedColumn && !mappedColumn) {
            event.preventDefault();
            onTapAssign?.(termName);
        }
    };

    const getBorderStyle = () => {
        if (isOver) return 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 scale-[1.02]';
        if (hasSelectedColumn && !mappedColumn) return 'border-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/20 border-dashed animate-pulse cursor-pointer';
        if (mappedColumn && isValid) return 'border-green-400 bg-green-50 dark:bg-green-900/20';
        if (mappedColumn && !isValid) return 'border-red-400 bg-red-50 dark:bg-red-900/20';
        if (isRequired) return 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/10 border-dashed';
        return 'border-border bg-muted/30 border-dashed';
    };

    const termDescription = language === 'de' && term?.descriptionDE ? term.descriptionDE : language === 'fr' && term?.descriptionFR ? term.descriptionFR : language === 'en' && term?.descriptionEN ? term.descriptionEN : term?.description;
    const catName = categoryInfo?.name[language] || categoryInfo?.name['en'] || category;
    const zoneAriaLabel = pick(
        `${termName}. ${isRequired ? t('common.required') : 'Opcjonalne'}${mappedColumn ? `, zmapowane do ${mappedColumn}` : ', bez mapowania'}.`,
        `${termName}. ${isRequired ? t('common.required') : 'Optional'}${mappedColumn ? `, mapped to ${mappedColumn}` : ', not mapped'}.`,
        `${termName}. ${isRequired ? t('common.required') : 'Optionnel'}${mappedColumn ? `, associé à ${mappedColumn}` : ', non associé'}.`,
        `${termName}. ${isRequired ? t('common.required') : 'Optional'}${mappedColumn ? `, zugeordnet zu ${mappedColumn}` : ', nicht zugeordnet'}.`
    );

    return (
        <TooltipProvider>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                role={hasSelectedColumn && !mappedColumn ? "button" : "group"}
                tabIndex={hasSelectedColumn && !mappedColumn ? 0 : undefined}
                aria-label={zoneAriaLabel}
                className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    min-h-[80px] flex flex-col justify-center
                    ${getBorderStyle()}
                `}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white cursor-help">
                                        {termName}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm">
                                    <div className="space-y-2">
                                        <p className="font-semibold flex items-center gap-2">
                                            <LinkIcon className="w-3 h-3" />
                                            <a
                                                href={`https://dwc.tdwg.org/terms/#dwc:${termName}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                dwc:{termName}
                                            </a>
                                        </p>
                                        <p className="text-sm">{termDescription}</p>
                                        {term?.example && (
                                            <code className="block text-xs bg-slate-700 text-slate-200 p-2 rounded">
                                                {t('common.example')}: {term.example}
                                            </code>
                                        )}
                                        {term?.allowedValues && (
                                            <div className="text-xs">
                                                <span className="text-slate-500">{t('common.allowed')}:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {term.allowedValues.map(v => (
                                                        <Badge key={v} variant="outline" className="text-xs">
                                                            {v}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>

                            {isRequired && (
                                <Badge variant="destructive" className="text-xs">
                                    {t('common.required')}
                                </Badge>
                            )}

                            {categoryInfo && (
                                <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{ borderColor: categoryInfo.color, color: categoryInfo.color }}
                                >
                                    {catName}
                                </Badge>
                            )}
                        </div>

                        {termDescription && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {termDescription}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {hasSelectedColumn && !mappedColumn && (
                            <MousePointerClick className="w-4 h-4 text-indigo-400 animate-bounce" aria-hidden="true" />
                        )}
                        {mappedColumn && !isValid && (
                            <span className="text-red-500" aria-hidden="true">
                                <X className="w-4 h-4" />
                            </span>
                        )}
                        {mappedColumn && isValid && (
                            <span className="text-green-500" aria-hidden="true">
                                <Check className="w-4 h-4" />
                            </span>
                        )}
                        {mappedColumn && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); onRemove?.(termName); }}
                                aria-label={`${t('common.remove')}: ${termName}`}
                                className="text-xs h-6 px-2"
                            >
                                {t('common.remove')}
                            </Button>
                        )}
                        {!mappedColumn && !hasSelectedColumn && isRequired && (
                            <Target className="w-4 h-4 text-orange-400 animate-pulse" aria-hidden="true" />
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {mappedColumn && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pt-2 border-t border-slate-700"
                        >
                            <p className="text-xs text-foreground">
                                <span className="font-semibold">{t('common.mapping')}:</span> {mappedColumn}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </TooltipProvider>
    );
}
