import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Globe, Download, FileSpreadsheet, Columns, CheckCircle, 
  ArrowRight, ArrowLeft, ExternalLink, Search, Filter, Table
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface DataImportTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function DataImportTutorial({ onComplete, onSkip }: DataImportTutorialProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Globe className="w-10 h-10" />,
      titleKey: 'importTutorial.step1.title',
      descKey: 'importTutorial.step1.desc',
      details: [
        'importTutorial.step1.detail1',
        'importTutorial.step1.detail2',
        'importTutorial.step1.detail3',
      ],
      link: 'https://www.gbif.org/occurrence/search',
      linkLabel: 'GBIF Occurrence Search',
      visual: (
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
      ),
    },
    {
      icon: <Filter className="w-10 h-10" />,
      titleKey: 'importTutorial.step2.title',
      descKey: 'importTutorial.step2.desc',
      details: [
        'importTutorial.step2.detail1',
        'importTutorial.step2.detail2',
        'importTutorial.step2.detail3',
      ],
      visual: (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{`Scientific name`}</span>
            <span className="text-foreground font-medium">Quercus robur</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Country</span>
            <span className="text-foreground font-medium">Poland</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Year</span>
            <span className="text-foreground font-medium">2020–2024</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Has coordinates</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">✓ Yes</span>
          </div>
        </div>
      ),
    },
    {
      icon: <Download className="w-10 h-10" />,
      titleKey: 'importTutorial.step3.title',
      descKey: 'importTutorial.step3.desc',
      details: [
        'importTutorial.step3.detail1',
        'importTutorial.step3.detail2',
        'importTutorial.step3.detail3',
      ],
      link: 'https://www.gbif.org',
      linkLabel: 'gbif.org',
      visual: (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Download className="w-4 h-4 text-primary" /> Download
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-foreground">Simple CSV</span>
              <span className="text-muted-foreground text-xs ml-auto">— tab-separated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-foreground">Darwin Core Archive</span>
              <span className="text-muted-foreground text-xs ml-auto">— full DwC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-foreground">Species List</span>
              <span className="text-muted-foreground text-xs ml-auto">— taxonomy</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <FileSpreadsheet className="w-10 h-10" />,
      titleKey: 'importTutorial.step4.title',
      descKey: 'importTutorial.step4.desc',
      details: [
        'importTutorial.step4.detail1',
        'importTutorial.step4.detail2',
        'importTutorial.step4.detail3',
      ],
      visual: (
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['eventID', 'scientificName', 'decimalLatitude', 'decimalLongitude'].map(h => (
                  <th key={h} className="px-2 py-1.5 text-left text-emerald-700 dark:text-emerald-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="px-2 py-1.5 text-foreground">EVT001</td>
                <td className="px-2 py-1.5 text-foreground italic">Quercus robur</td>
                <td className="px-2 py-1.5 text-foreground">52.4064</td>
                <td className="px-2 py-1.5 text-foreground">16.9252</td>
              </tr>
              <tr>
                <td className="px-2 py-1.5 text-foreground">EVT002</td>
                <td className="px-2 py-1.5 text-foreground italic">Parus major</td>
                <td className="px-2 py-1.5 text-foreground">52.4095</td>
                <td className="px-2 py-1.5 text-foreground">16.9318</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      icon: <Columns className="w-10 h-10" />,
      titleKey: 'importTutorial.step5.title',
      descKey: 'importTutorial.step5.desc',
      details: [
        'importTutorial.step5.detail1',
        'importTutorial.step5.detail2',
        'importTutorial.step5.detail3',
      ],
      visual: (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">species</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">scientificName</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">lat</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">decimalLatitude</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">date</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">eventDate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="flex items-center justify-center py-4 md:py-8">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-8 bg-primary' : i < currentStep ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
                }`}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground text-xs">
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
