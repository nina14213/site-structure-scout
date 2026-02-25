import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Language } from '@/i18n/translations';

const LANG_CYCLE: Record<Language, Language> = { pl: 'en', en: 'fr', fr: 'pl' };
const LANG_LABELS: Record<Language, string> = { pl: 'EN', en: 'FR', fr: 'PL' };
const LANG_TITLES: Record<Language, string> = {
  pl: 'Switch to English',
  en: 'Passer au français',
  fr: 'Zmień na polski',
};

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(LANG_CYCLE[language])}
      className={`text-slate-400 hover:text-white ${className}`}
      title={LANG_TITLES[language]}
    >
      <span className="text-xs font-bold uppercase">{LANG_LABELS[language]}</span>
    </Button>
  );
}
