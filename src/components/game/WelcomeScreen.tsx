import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Database,
  HelpCircle,
  Moon,
  Package,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AssistantAvatarArt from '@/components/AssistantAvatarArt';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/i18n/LanguageContext';
import { assistantProfiles, type AssistantId } from '@/lib/assistants';

interface WelcomeScreenProps {
  onEnter: (playerName: string, assistantId: AssistantId) => void;
  soundEnabled?: boolean;
  toggleSound?: () => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function WelcomeScreen({
  onEnter,
  soundEnabled,
  toggleSound,
  darkMode,
  toggleDarkMode,
}: WelcomeScreenProps) {
  const { t } = useLanguage();
  const [playerName, setPlayerName] = useState('');
  const [selectedAssistantId, setSelectedAssistantId] = useState<AssistantId | null>(null);
  const trimmedPlayerName = playerName.trim();

  const selectedAssistant = selectedAssistantId
    ? assistantProfiles.find((assistant) => assistant.id === selectedAssistantId) ?? null
    : null;
  const canEnter = Boolean(trimmedPlayerName && selectedAssistantId);
  const portalFeatures = [
    { icon: Database, label: t('welcome.feature.mapping') },
    { icon: Package, label: t('welcome.feature.package') },
    { icon: ShieldCheck, label: t('welcome.feature.validation') },
  ];

  const handleEnter = () => {
    if (!trimmedPlayerName || !selectedAssistantId) return;
    onEnter(trimmedPlayerName, selectedAssistantId);
  };

  return (
    <div className="min-h-screen bg-background p-4 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col md:min-h-[calc(100vh-4rem)]">
        <div className="mb-8 flex justify-end gap-4" role="toolbar" aria-label="Ustawienia gry">
          <LanguageToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Wylacz dzwiek' : 'Wlacz dzwiek'}
            aria-pressed={!!soundEnabled}
            className="text-muted-foreground hover:text-foreground"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Wlacz jasny motyw' : 'Wlacz ciemny motyw'}
            aria-pressed={!!darkMode}
            className="text-muted-foreground hover:text-foreground"
          >
            {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-3 lg:items-start">
              {selectedAssistantId ? (
                <AssistantAvatarArt assistantId={selectedAssistantId} className="h-36 w-36 drop-shadow-2xl sm:h-44 sm:w-44" animated />
              ) : (
                <div
                  className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-dashed border-primary/30 bg-card/80 text-7xl font-black text-primary/70 shadow-2xl shadow-black/10 backdrop-blur sm:h-44 sm:w-44 sm:text-8xl"
                  aria-label={t('welcome.defaultAssistantAria')}
                  role="img"
                >
                  ?
                </div>
              )}
              {selectedAssistant && (
                <Badge className={selectedAssistant.badgeClass}>
                  {t('welcome.selectedCharacter', { name: t(selectedAssistant.nameKey) })}
                </Badge>
              )}
            </div>
            <div className="space-y-4 text-center lg:text-left">
              <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                {t('welcome.kicker')}
              </Badge>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent md:text-6xl">
                  {t('welcome.title')}
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                  {t('welcome.description')}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {portalFeatures.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={feature.label} className="rounded-lg border border-border bg-card/60 p-3 text-center shadow-sm backdrop-blur">
                    <FeatureIcon className="mx-auto mb-2 h-5 w-5 text-primary" aria-hidden="true" />
                    <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
          >
            <Card className="border-border bg-card/70 shadow-2xl shadow-black/15 backdrop-blur">
              <CardContent className="space-y-6 p-5 sm:p-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">{t('welcome.setupTitle')}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t('welcome.setupDescription')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome-name" className="text-muted-foreground">
                    {t('start.playerNameLabel')}
                  </Label>
                  <Input
                    id="welcome-name"
                    placeholder={t('start.playerNamePlaceholder')}
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleEnter()}
                    className="bg-muted/50 py-6 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t('assistant.selection.title')}</h3>
                    <p className="text-xs text-muted-foreground">{t('assistant.selection.description')}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t('assistant.selection.aria')}>
                    {assistantProfiles.map((assistant) => {
                      const selected = assistant.id === selectedAssistantId;
                      const assistantName = t(assistant.nameKey);
                      return (
                        <button
                          key={assistant.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={t('assistant.selection.optionAria', { name: assistantName })}
                          onClick={() => setSelectedAssistantId(assistant.id)}
                          className={`min-h-[12rem] rounded-lg border p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${selected ? `${assistant.selectedRingClass} ring-2` : `border-border bg-muted/20 ${assistant.selectionClass}`}`}
                        >
                          <span className="mb-2 flex items-center justify-center">
                            <AssistantAvatarArt assistantId={assistant.id} className="h-16 w-16" />
                          </span>
                          <span className="block text-sm font-bold text-foreground">{assistantName}</span>
                          <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                            {t(assistant.descriptionKey)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`rounded-lg border p-3 ${selectedAssistant ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/35 bg-amber-500/10'}`}>
                  <div className="flex items-start gap-3">
                    {selectedAssistant ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                    ) : (
                      <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                    )}
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedAssistant
                        ? t('welcome.assistantNote', { name: t(selectedAssistant.nameKey) })
                        : t('welcome.chooseAssistantNote')}
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleEnter}
                  disabled={!canEnter}
                  className="w-full bg-gradient-to-r from-emerald-700 to-cyan-800 py-6 text-lg text-white hover:from-lime-300 hover:via-green-300 hover:to-emerald-400 hover:text-slate-950 hover:brightness-100 focus-visible:ring-white/80"
                >
                  <Play className="h-5 w-5" aria-hidden="true" />
                  {t('welcome.enterMenu')}
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
