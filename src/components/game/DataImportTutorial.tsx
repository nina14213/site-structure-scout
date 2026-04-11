import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Globe, Download, FileSpreadsheet, Columns, CheckCircle, 
  ArrowRight, ArrowLeft, ExternalLink, Search, X
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import GlossaryTerm from './tutorial/GlossaryTerm';

interface DataImportTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

/** Visual for step 1: GBIF search */
function GbifSearchVisual() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
        <Search className="w-4 h-4" /> gbif.org/occurrence/search
      </div>
      <div className="flex flex-wrap gap-2">
        {['Species', 'Country', 'Year', 'Dataset'].map(f => (
          <span key={f} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">{f}</span>
        ))}
      </div>
    </div>
  );
}

/** Visual for step 2: Merged filter + download (fix #7) */
function FilterDownloadVisual() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Scientific name</span>
          <span className="text-foreground font-medium">Quercus robur</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Has coordinates</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">✓ Yes</span>
        </div>
      </div>
      <div className="border-t border-border pt-2 flex items-center gap-2">
        <Download className="w-4 h-4 text-primary" />
        <span className="text-foreground font-medium text-xs">Simple CSV</span>
        <span className="text-muted-foreground text-xs ml-auto">→ e-mail</span>
      </div>
    </div>
  );
}

/** Visual for step 3: CSV preview */
function CsvPreviewVisual() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {['eventID', 'scientificName', 'decimalLatitude'].map(h => (
              <th key={h} className="px-2 py-1.5 text-left text-emerald-700 dark:text-emerald-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50">
            <td className="px-2 py-1.5 text-foreground">EVT001</td>
            <td className="px-2 py-1.5 text-foreground italic">Quercus robur</td>
            <td className="px-2 py-1.5 text-foreground">52.4064</td>
          </tr>
          <tr>
            <td className="px-2 py-1.5 text-foreground">EVT002</td>
            <td className="px-2 py-1.5 text-foreground italic">Parus major</td>
            <td className="px-2 py-1.5 text-foreground">52.4095</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Visual for step 4: mapping arrows */
function MappingVisual() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
      {[
        { from: 'species', to: 'scientificName' },
        { from: 'lat', to: 'decimalLatitude' },
        { from: 'date', to: 'eventDate' },
      ].map(({ from, to }) => (
        <div key={from} className="flex items-center gap-3">
          <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">{from}</span>
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">{to}</span>
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      ))}
    </div>
  );
}

export default function DataImportTutorial({ onComplete, onSkip }: DataImportTutorialProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  // 4 steps instead of 5 (fix #7: merged filter + download)
  const steps = [
    {
      icon: <Globe className="w-10 h-10" />,
      titleKey: 'importTutorial.step1.title',
      descKey: 'importTutorial.step1.desc',
      details: [
        'importTutorial.step1.detail1',
        'importTutorial.step1.detail2',
      ],
      link: 'https://www.gbif.org/occurrence/search',
      linkLabel: 'GBIF Occurrence Search',
      visual: <GbifSearchVisual />,
    },
    {
      icon: <Download className="w-10 h-10" />,
      titleKey: 'importTutorial.step2m.title',
      descKey: 'importTutorial.step2m.desc',
      details: [
        'importTutorial.step2m.detail1',
        'importTutorial.step2m.detail2',
      ],
      link: 'https://www.gbif.org',
      linkLabel: 'gbif.org',
      visual: <FilterDownloadVisual />,
    },
    {
      icon: <FileSpreadsheet className="w-10 h-10" />,
      titleKey: 'importTutorial.step3m.title',
      descKey: 'importTutorial.step3m.desc',
      details: [
        'importTutorial.step3m.detail1',
        'importTutorial.step3m.detail2',
      ],
      visual: <CsvPreviewVisual />,
    },
    {
      icon: <Columns className="w-10 h-10" />,
      titleKey: 'importTutorial.step4m.title',
      descKey: 'importTutorial.step4m.desc',
      details: [
        'importTutorial.step4m.detail1',
        'importTutorial.step4m.detail2',
      ],
      visual: <MappingVisual />,
    },
  ];

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="flex items-center justify-center py-4 md:py-8">
      <div className="w-full max-w-2xl">
        {/* Progress bar with numbers (fix #5) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
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
            <span className="ml-2 text-[10px] text-muted-foreground">{currentStep + 1}/{steps.length}</span>
          </div>
          {/* More visible skip (fix #4) */}
          <Button variant="outline" size="sm" onClick={onSkip} className="text-muted-foreground text-xs border-border">
            {t('importTutorial.skip')}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 md:p-8 shadow-lg"
          >
            {/* Step Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                {step.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {t('importTutorial.stepLabel', { current: String(currentStep + 1), total: String(steps.length) })}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{t(step.titleKey)}</h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-4 leading-relaxed">{t(step.descKey)}</p>

            {/* Details */}
            <ul className="space-y-2 mb-5">
              {step.details.map((dKey, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>{t(dKey)}</span>
                </li>
              ))}
            </ul>

            {/* Visual */}
            {step.visual && <div className="mb-5">{step.visual}</div>}

            {/* Link */}
            {step.link && (
              <a
                href={step.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {step.linkLabel}
              </a>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 0}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('importTutorial.prev')}
              </Button>

              <Button
                onClick={() => isLast ? onComplete() : setCurrentStep(s => s + 1)}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
              >
                {isLast ? t('importTutorial.start') : t('importTutorial.next')}
                {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
