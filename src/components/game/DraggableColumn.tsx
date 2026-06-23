import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Check, MousePointerClick } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { dwcTerms } from './DwCTerms';
import { useLanguage } from '@/i18n/LanguageContext';

interface DraggableColumnProps {
    column: string;
    index: number;
    isDragging: boolean;
    mappedTo: string | null;
    isSelected?: boolean;
    onDragStart?: (column: string, index: number) => void;
    onDragEnd?: () => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent, column: string) => void;
    onTapSelect?: (column: string) => void;
    sampleValues?: string[];
}

export default function DraggableColumn({
    column,
    index,
    isDragging,
    mappedTo,
    isSelected = false,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onTapSelect,
    sampleValues = []
}: DraggableColumnProps) {
    const { t, language } = useLanguage();
    const suppressClickAfterDragRef = useRef(false);
    const pick = (pl: string, en: string, fr: string, de: string) => {
        if (language === 'en') return en;
        if (language === 'fr') return fr;
        if (language === 'de') return de;
        return pl;
    };
    const term = mappedTo ? dwcTerms[mappedTo] : null;
    const termDescription = term
        ? (language === 'de' && term.descriptionDE ? term.descriptionDE
            : language === 'fr' && term.descriptionFR ? term.descriptionFR
            : language === 'en' && term.descriptionEN ? term.descriptionEN
            : term.description)
        : null;

    const getStatusColor = () => {
        if (!mappedTo) {
            return isSelected
                ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400/50'
                : 'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800';
        }

        // PL: Samo polaczenie jest stanem akceptacji, dlatego obie ramki sa zielone.
        // EN: The mapping itself is an accepted state, so both frames stay green.
        return 'border-green-400 bg-green-50 dark:bg-green-900/20';
    };

    const getMappedSelectionRing = () => {
        if (!isSelected || !mappedTo) return '';
        return 'ring-2 ring-green-400/50';
    };

    const getStatusIcon = () => {
        if (isSelected && !mappedTo) return <MousePointerClick className="w-4 h-4 text-indigo-500" aria-hidden="true" />;
        if (mappedTo) return <Check className="w-4 h-4 text-green-500" aria-hidden="true" />;
        return null;
    };

    const handleActivate = () => {
        if (suppressClickAfterDragRef.current) {
            suppressClickAfterDragRef.current = false;
            return;
        }
        onTapSelect?.(column);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleActivate();
        }
    };

    const actionLabel = isSelected
        ? pick('odznaczyć', 'deselect', 'désélectionner', 'abzuwählen')
        : pick('wybrać', 'select', 'sélectionner', 'auszuwählen');

    const columnAriaLabel = pick(
        `Kolumna ${column}${mappedTo ? `, zmapowana do ${mappedTo}` : ', niezmapowana'}. Naciśnij Enter lub Spację, aby ${actionLabel} kolumnę.`,
        `Column ${column}${mappedTo ? `, mapped to ${mappedTo}` : ', not mapped'}. Press Enter or Space to ${actionLabel} this column.`,
        `Colonne ${column}${mappedTo ? `, associée à ${mappedTo}` : ', non associée'}. Appuyez sur Entrée ou Espace pour ${actionLabel} cette colonne.`,
        `Spalte ${column}${mappedTo ? `, zugeordnet zu ${mappedTo}` : ', nicht zugeordnet'}. Drücke Enter oder Leertaste, um diese Spalte ${actionLabel}.`
    );

    return (
        <TooltipProvider>
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{
                    opacity: isDragging ? 0.5 : 1,
                    x: 0,
                    scale: isDragging ? 1.05 : isSelected ? 1.02 : 1
                }}
                exit={{ opacity: 0, x: 20 }}
                draggable
                onDragStart={(e) => {
                    suppressClickAfterDragRef.current = true;
                    const dragEvent = e as unknown as React.DragEvent;
                    dragEvent.dataTransfer?.setData('text/plain', column);
                    dragEvent.dataTransfer?.setData('columnIndex', String(index));
                    onDragStart?.(column, index);
                }}
                onDragEnd={() => {
                    onDragEnd?.();
                    window.setTimeout(() => {
                        suppressClickAfterDragRef.current = false;
                    }, 500);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    onDragOver?.(e as unknown as React.DragEvent);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    onDrop?.(e as unknown as React.DragEvent, column);
                }}
                onClick={handleActivate}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={columnAriaLabel}
                aria-grabbed={isDragging}
                className={`
                    p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing
                    transition-all duration-200 select-none
                    ${getStatusColor()}
                    ${getMappedSelectionRing()}
                    hover:shadow-md hover:scale-[1.02]
                    ${onTapSelect ? 'md:cursor-grab cursor-pointer' : ''}
                `}
            >
                <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-500 dark:text-slate-400 flex-shrink-0 hidden md:block" aria-hidden="true" />
                    <MousePointerClick className="w-4 h-4 text-gray-500 dark:text-slate-400 flex-shrink-0 md:hidden" aria-hidden="true" />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-slate-200 truncate">
                                {column}
                            </span>
                            {getStatusIcon()}
                        </div>

                        {mappedTo && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="outline"
                                        className="text-xs bg-slate-700/50 cursor-help"
                                    >
                                        &rarr; {mappedTo}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-2">
                                        <p className="font-semibold">{mappedTo}</p>
                                        <p className="text-sm text-slate-300">
                                            {termDescription}
                                        </p>
                                        {term?.example && (
                                            <p className="text-xs">
                                                <span className="text-slate-500">{t('common.example')}:</span>{' '}
                                                <code className="bg-slate-700 text-slate-200 px-1 rounded">
                                                    {term.example}
                                                </code>
                                            </p>
                                        )}
                                        {term?.required && (
                                            <Badge variant="destructive" className="text-xs">
                                                {t('common.required')}
                                            </Badge>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {sampleValues.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-slate-400 truncate">
                                <span className="opacity-60">{language === 'en' ? 'e.g.' : language === 'de' ? 'z.B.' : language === 'fr' ? 'ex.' : 'np'}:</span> {sampleValues.slice(0, 2).join(', ')}
                                {sampleValues.length > 2 && '...'}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </TooltipProvider>
    );
}
