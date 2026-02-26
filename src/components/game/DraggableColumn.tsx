import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Check, X, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { dwcTerms } from './DwCTerms';
import { useLanguage } from '@/i18n/LanguageContext';

interface DraggableColumnProps {
    column: string;
    index: number;
    isDragging: boolean;
    mappedTo: string | null;
    validationStatus: 'valid' | 'warning' | 'error' | null;
    onDragStart?: (column: string, index: number) => void;
    onDragEnd?: () => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent, column: string) => void;
    sampleValues?: string[];
}

export default function DraggableColumn({
    column,
    index,
    isDragging,
    mappedTo,
    validationStatus,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    sampleValues = []
}: DraggableColumnProps) {
    const { t, language } = useLanguage();
    const term = mappedTo ? dwcTerms[mappedTo] : null;
    const termDescription = term
        ? (language === 'de' && term.descriptionDE ? term.descriptionDE
            : language === 'fr' && term.descriptionFR ? term.descriptionFR
            : language === 'en' && term.descriptionEN ? term.descriptionEN
            : term.description)
        : null;

    const getStatusColor = () => {
        if (!mappedTo) return 'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800';
        if (validationStatus === 'valid') return 'border-green-400 bg-green-50 dark:bg-green-900/30';
        if (validationStatus === 'warning') return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
        if (validationStatus === 'error') return 'border-red-400 bg-red-50 dark:bg-red-900/30';
        return 'border-blue-400 bg-blue-50 dark:bg-blue-900/30';
    };

    const getStatusIcon = () => {
        if (validationStatus === 'valid') return <Check className="w-4 h-4 text-green-500" />;
        if (validationStatus === 'warning') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        if (validationStatus === 'error') return <X className="w-4 h-4 text-red-500" />;
        return null;
    };

    return (
        <TooltipProvider>
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{
                    opacity: isDragging ? 0.5 : 1,
                    x: 0,
                    scale: isDragging ? 1.05 : 1
                }}
                exit={{ opacity: 0, x: 20 }}
                draggable
                onDragStart={(e) => {
                    const dragEvent = e as unknown as React.DragEvent;
                    dragEvent.dataTransfer?.setData('text/plain', column);
                    dragEvent.dataTransfer?.setData('columnIndex', String(index));
                    onDragStart?.(column, index);
                }}
                onDragEnd={onDragEnd}
                onDragOver={(e) => {
                    e.preventDefault();
                    onDragOver?.(e as unknown as React.DragEvent);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    onDrop?.(e as unknown as React.DragEvent, column);
                }}
                className={`
                    p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing
                    transition-all duration-200 select-none
                    ${getStatusColor()}
                    hover:shadow-md hover:scale-[1.02]
                `}
            >
                <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-500 dark:text-slate-400 flex-shrink-0" />

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
                                        → {mappedTo}
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
