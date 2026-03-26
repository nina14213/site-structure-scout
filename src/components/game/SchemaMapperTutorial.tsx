import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, FileSpreadsheet, Layers, Sparkles, Minimize2, Download, X, Key, GitMerge } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface SchemaMapperTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  /** Phase 1 = intro steps (0-3), Phase 2 = post-mapping steps (4-6). Default: 1 */
  phase?: 1 | 2;
}

const HIGHLIGHT_SELECTORS = [
  null, // step 0: intro, no highlight
  '[data-tour="columns-panel"]',
  '[data-tour="schemas-panel"]',
  '[data-tour="schemas-panel"]', // step 3: multi-column pipe (same panel)
  '[data-tour="auto-map-btn"]',
  '[data-tour="optimal-layout"]',
  '[data-tour="schemas-panel"]', // step 6: dismiss schemas
  '[data-tour="download-panel"]',
  '[data-tour="download-panel"]', // step 8: ID gen (same panel)
  null, // step 9: outro
];

interface TutorialStep {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  position: 'center' | 'left' | 'right' | 'bottom';
}

export default function SchemaMapperTutorial({ onComplete, onSkip, phase = 1 }: SchemaMapperTutorialProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const allSteps: TutorialStep[] = [
    {
      titleKey: 'mapperTutorial.step0.title',
      descKey: 'mapperTutorial.step0.desc',
      icon: <span className="text-5xl">🦎</span>,
      position: 'center',
    },
    {
      titleKey: 'mapperTutorial.step1.title',
      descKey: 'mapperTutorial.step1.desc',
      icon: <FileSpreadsheet className="w-8 h-8" />,
      position: 'right',
    },
    {
      titleKey: 'mapperTutorial.step2.title',
      descKey: 'mapperTutorial.step2.desc',
      icon: <Layers className="w-8 h-8" />,
      position: 'left',
    },
    {
      titleKey: 'mapperTutorial.step3.title',
      descKey: 'mapperTutorial.step3.desc',
      icon: <GitMerge className="w-8 h-8" />,
      position: 'left',
    },
    {
      titleKey: 'mapperTutorial.step4.title',
      descKey: 'mapperTutorial.step4.desc',
      icon: <Sparkles className="w-8 h-8" />,
      position: 'right',
    },
    {
      titleKey: 'mapperTutorial.step5.title',
      descKey: 'mapperTutorial.step5.desc',
      icon: <Minimize2 className="w-8 h-8" />,
      position: 'center',
    },
    {
      titleKey: 'mapperTutorial.step6.title',
      descKey: 'mapperTutorial.step6.desc',
      icon: <X className="w-8 h-8" />,
      position: 'left',
    },
    {
      titleKey: 'mapperTutorial.step7.title',
      descKey: 'mapperTutorial.step7.desc',
      icon: <Download className="w-8 h-8" />,
      position: 'center',
    },
    {
      titleKey: 'mapperTutorial.step8.title',
      descKey: 'mapperTutorial.step8.desc',
      icon: <Key className="w-8 h-8" />,
      position: 'center',
    },
    {
      titleKey: 'mapperTutorial.step9.title',
      descKey: 'mapperTutorial.step9.desc',
      icon: <span className="text-5xl">🦎</span>,
      position: 'center',
    },
  ];

  // Phase 1: steps 0-3 (intro, columns, schemas, auto-map)
  // Phase 2: steps 4-8 (optimal layout, dismiss, download, ID gen, outro)
  const steps = phase === 1 ? allSteps.slice(0, 4) : allSteps.slice(4);
  const highlightSelectors = phase === 1 ? HIGHLIGHT_SELECTORS.slice(0, 4) : HIGHLIGHT_SELECTORS.slice(4);

  const updateHighlight = useCallback(() => {
    const selector = highlightSelectors[currentStep];
    if (!selector) {
      setHighlightRect(null);
      return;
    }
    const el = document.querySelector(selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setHighlightRect(null);
    }
  }, [currentStep, highlightSelectors]);

  useEffect(() => {
    updateHighlight();
    const timer = setTimeout(updateHighlight, 300);
    window.addEventListener('resize', updateHighlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHighlight);
    };
  }, [updateHighlight]);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const totalSteps = steps.length;

  // Calculate tooltip position based on highlighted element
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002,
      };
    }

    const padding = 20;
    const tooltipWidth = 380;
    const tooltipHeight = 320; // approximate max height
    const maxTop = window.innerHeight - tooltipHeight - padding;

    if (step.position === 'right') {
      return {
        position: 'fixed',
        top: Math.min(Math.max(padding, highlightRect.top), maxTop),
        left: Math.min(highlightRect.right + padding, window.innerWidth - tooltipWidth - padding),
        zIndex: 10002,
      };
    }
    if (step.position === 'left') {
      return {
        position: 'fixed',
        top: Math.min(Math.max(padding, highlightRect.top), maxTop),
        left: Math.max(padding, highlightRect.left - tooltipWidth - padding),
        zIndex: 10002,
      };
    }
    // bottom
    return {
      position: 'fixed',
      top: Math.min(highlightRect.bottom + padding, maxTop),
      left: Math.max(padding, highlightRect.left),
      zIndex: 10002,
    };
  };

  return (
    <div className="fixed inset-0 z-[10000]" onClick={(e) => e.stopPropagation()}>
      {/* Dark overlay with cutout */}
      <svg className="fixed inset-0 w-full h-full" style={{ zIndex: 10000 }}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#tutorial-mask)"
        />
        {/* Highlight border */}
        {highlightRect && (
          <rect
            x={highlightRect.left - 8}
            y={highlightRect.top - 8}
            width={highlightRect.width + 16}
            height={highlightRect.height + 16}
            rx="12"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.25 }}
          style={getTooltipStyle()}
          className="w-[360px] max-w-[90vw]"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 relative">
            {/* Mascot floating */}
            <div className="absolute -top-8 -right-4 text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
              🦎
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-8 bg-primary' : i < currentStep ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {step.icon}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {t('mapperTutorial.stepLabel', { current: String(currentStep + 1), total: String(totalSteps) })}
                </p>
                <h3 className="text-lg font-bold text-foreground leading-tight">{t(step.titleKey)}</h3>
              </div>
            </div>

            {/* Description */}
            <div className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">{t(step.descKey)}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex gap-2">
                {!isFirst && (
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(s => s - 1)} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('mapperTutorial.prev')}
                  </Button>
                )}
                {isFirst && (
                  <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground text-xs">
                    {t('mapperTutorial.skip')}
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => isLast ? onComplete() : setCurrentStep(s => s + 1)}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
              >
                {isLast ? t('mapperTutorial.finish') : t('mapperTutorial.next')}
                {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip button always visible */}
      <button
        onClick={onSkip}
        className="fixed top-4 right-4 z-[10003] p-2 rounded-full bg-card/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
