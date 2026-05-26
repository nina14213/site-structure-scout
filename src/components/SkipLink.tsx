import { useLanguage } from '@/i18n/LanguageContext';

/**
 * Skip link — pierwszy fokusowalny element strony.
 * Niewidoczny dopóki nie otrzyma focusu (Tab), kieruje do <main id="main">.
 * WCAG 2.4.1 (Bypass Blocks).
 */
export function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {t('a11y.skipToContent')}
    </a>
  );
}

export default SkipLink;
