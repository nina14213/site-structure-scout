import { BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const ResourcesSection = () => {
  const { t } = useLanguage();

  const resources = [
    { name: 'Darwin Core Terms', url: 'https://dwc.tdwg.org/terms/' },
    { name: 'GBIF IPT', url: 'https://www.gbif.org/ipt' },
    { name: 'GBIF Validator', url: 'https://www.gbif.org/tools/data-validator' },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-primary" size={28} />
            <h3 className="font-display text-2xl">{t('resources.title')}</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-8">
            {resources.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/50 transition-all group"
              >
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {resource.name}
                </span>
                <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="text-secondary" size={24} />
            <h4 className="font-display text-xl">{t('resources.howToPlay')}</h4>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {t('resources.description')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
