import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'pl' ? 'en' : 'pl')}
      className={`text-slate-400 hover:text-white ${className}`}
      title={language === 'pl' ? 'Switch to English' : 'Zmień na polski'}
    >
      <span className="text-xs font-bold uppercase">{language === 'pl' ? 'EN' : 'PL'}</span>
    </Button>
  );
}
