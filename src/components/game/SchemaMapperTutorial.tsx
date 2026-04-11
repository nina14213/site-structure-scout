import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, FileSpreadsheet, Sparkles, Download, X, Star, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import TutorialAnimation from './tutorial/TutorialAnimation';
import GlossaryTerm from './tutorial/GlossaryTerm';

interface SchemaMapperTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  /** Phase 1 = mapping steps (0-3), Phase 2 = review+download steps (4-6). Default: 1 */
  phase?: 1 | 2;
}

const HIGHLIGHT_SELECTORS = [
  null,                              // step 0: intro
  '[data-tour="columns-panel"]',     // step 1: drag column
  '[data-tour="auto-map-btn"]',      // step 2: auto-map
  '[data-tour="schemas-panel"]',     // step 3: ⭐ pro tip — pipe (now last)
  '[data-tour="optimal-layout"]',    // step 4: review (phase 2)
  '[data-tour="extra-columns-btn"]', // step 5: ⭐ pro tip — extra cols
  '[data-tour="download-panel"]',    // step 6: download + ID gen
];

interface TutorialStep {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  position: 'center' | 'left' | 'right' | 'bottom';
  animation?: React.ReactNode;
  proTip?: boolean;
  /** Motivation line — shown above description */
  whyKey?: string;
}

export default function SchemaMapperTutorial({ onComplete, onSkip, phase = 1 }: SchemaMapperTutorialProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const allSteps: TutorialStep[] = [
    // --- Phase 1: Mapping (steps 0-3) ---
    // Step 0: SHORT intro (fix #1 + #9)
    {
      titleKey: 'mapperTutorial.step0.title',
      descKey: 'mapperTutorial.step0.desc',
      icon: <span className="text-4xl">🦎</span>,
      position: 'center',
      animation: <TutorialAnimation type="file-to-table" />,
    },
    // Step 1: Drag column (fix #3 — why)
    {
      titleKey: 'mapperTutorial.step1.title',
      descKey: 'mapperTutorial.step1.desc',
      whyKey: 'mapperTutorial.step1.why',
      icon: <FileSpreadsheet className="w-7 h-7" />,
      position: 'right',
      animation: <TutorialAnimation type="drag-drop" />,
    },
    // Step 2: Auto-map (fix #3 — why)
    {
      titleKey: 'mapperTutorial.step2.title',
      descKey: 'mapperTutorial.step2.desc',
      whyKey: 'mapperTutorial.step2.why',
      icon: <Sparkles className="w-7 h-7" />,
      position: 'right',
      animation: <TutorialAnimation type="auto-map" />,
    },
    // Step 3: Pipe joining — NOW LAST in phase 1 (fix #2)
    {
      titleKey: 'mapperTutorial.step3.title',
      descKey: 'mapperTutorial.step3.desc',
      icon: <Star className="w-7 h-7" />,
      position: 'left',
      proTip: true,
    },
    // --- Phase 2: Review + Download (steps 4-6) ---
    // Step 4: Phase transition + review (fix #6)
    {
      titleKey: 'mapperTutorial.step4.title',
      descKey: 'mapperTutorial.step4.desc',
      whyKey: 'mapperTutorial.step4.why',
      icon: <span className="text-4xl">🦎</span>,
      position: 'center',
      animation: <TutorialAnimation type="checkmark" />,
    },
    // Step 5: Pro tip — extra cols
    {
      titleKey: 'mapperTutorial.step5.title',
      descKey: 'mapperTutorial.step5.desc',
      icon: <Star className="w-7 h-7" />,
      position: 'left',
      proTip: true,
    },
    // Step 6: Download + ID gen
    {
      titleKey: 'mapperTutorial.step6.title',
      descKey: 'mapperTutorial.step6.desc',
      whyKey: 'mapperTutorial.step6.why',
      icon: <Download className="w-7 h-7" />,
      position: 'center',
      animation: <TutorialAnimation type="download" />,
    },
  ];

  // Phase 1: steps 0-3, Phase 2: steps 4-6
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
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      updateHighlight();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateHighlight]);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const totalSteps = steps.length;
  const isMobile = windowWidth < 768;

  const getTooltipStyle = (): React.CSSProperties => {
    if (isMobile || !highlightRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002,
      };
    }

    const padding = 16;
    const tooltipWidth = Math.min(380, window.innerWidth - padding * 2);
    const tooltipHeight = 320;
    const maxTop = window.innerHeight - tooltipHeight - padding;

    if (step.position === 'right') {
      const leftPos = highlightRect.right + padding;
      if (leftPos + tooltipWidth > window.innerWidth - padding) {
        return {
          position: 'fixed',
          top: Math.min(Math.max(padding, highlightRect.bottom + padding), maxTop),
          left: Math.max(padding, (window.innerWidth - tooltipWidth) / 2),
          zIndex: 10002,
        };
      }
      return {
        position: 'fixed',
        top: Math.min(Math.max(padding, highlightRect.top), maxTop),
        left: leftPos,
        zIndex: 10002,
      };
    }
    if (step.position === 'left') {
      const leftPos = highlightRect.left - tooltipWidth - padding;
      if (leftPos < padding) {
        return {
          position: 'fixed',
          top: Math.min(Math.max(padding, highlightRect.bottom + padding), maxTop),
          left: Math.max(padding, (window.innerWidth - tooltipWidth) / 2),
          zIndex: 10002,
        };
      }
      return {
        position: 'fixed',
        top: Math.min(Math.max(padding, highlightRect.top), maxTop),
        left: leftPos,
        zIndex: 10002,
      };
    }
    return {
      position: 'fixed',
      top: Math.min(highlightRect.bottom + padding, maxTop),
      left: Math.max(padding, Math.min(highlightRect.left, window.innerWidth - tooltipWidth - padding)),
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
          className="w-[380px] max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 md:p-5 relative max-h-[80vh] flex flex-col">
            {/* Mascot */}
            <div className="absolute -top-8 -right-4 text-4xl animate-bounce hidden md:block" style={{ animationDuration: '2s' }}>
              🦎
            </div>

            {/* Pro tip badge */}
            {step.proTip && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/20">
                  ⭐ Pro tip
                </span>
                <span className="text-[10px] text-muted-foreground">{t('mapperTutorial.proTipNote')}</span>
              </div>
            )}

            {/* Phase transition banner (fix #6) */}
            {phase === 2 && currentStep === 0 && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <p className="text-xs font-semibold text-primary">🎉 {t('mapperTutorial.phaseTransition')}</p>
              </div>
            )}

            {/* Progress bar with numbers (fix #5) */}
            <div className="flex items-center gap-1 mb-3 md:mb-4">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`relative h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                    i === currentStep
                      ? 'w-8 bg-primary text-primary-foreground'
                      : i < currentStep
                        ? 'w-6 bg-primary/30 text-primary-foreground'
                        : 'w-6 bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-muted-foreground">
                {currentStep + 1}/{totalSteps}
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                {step.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">{t(step.titleKey)}</h3>
              </div>
            </div>

            {/* Why motivation line (fix #3) */}
            {step.whyKey && (
              <p className="text-[11px] text-primary/80 font-medium mb-1.5 italic">
                💡 {t(step.whyKey)}
              </p>
            )}

            {/* Description — scrollable, with GlossaryTerms (fix #8) */}
            <div className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-2 md:mb-3 whitespace-pre-line overflow-y-auto max-h-[30vh] md:max-h-none">
              {t(step.descKey)}
            </div>

            {/* Animation */}
            {step.animation && <div className="mb-3">{step.animation}</div>}

            {/* Navigation (fix #4 — more visible skip) */}
            <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                {!isFirst && (
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(s => s - 1)} className="text-muted-foreground text-xs md:text-sm">
                    <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                    {t('mapperTutorial.prev')}
                  </Button>
                )}
                {isFirst && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSkip}
                    className="text-muted-foreground text-xs border-border"
                  >
                    {t('mapperTutorial.skip')}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <span className="text-[9px] text-muted-foreground hidden md:inline">
                    {t('mapperTutorial.canReplay')}
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={() => isLast ? onComplete() : setCurrentStep(s => s + 1)}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-xs md:text-sm"
                >
                  {isLast ? t('mapperTutorial.finish') : t('mapperTutorial.next')}
                  {!isLast && <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Close button (fix #4 — bigger, with label) */}
      <button
        onClick={onSkip}
        className="fixed top-4 right-4 z-[10003] flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/90 border border-border text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">{t('mapperTutorial.close')}</span>
      </button>
    </div>
  );
}
