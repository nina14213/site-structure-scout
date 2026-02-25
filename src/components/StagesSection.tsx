import { Cpu, Link, Package, Shield, Search } from 'lucide-react';
import StageCard from './StageCard';
import { useLanguage } from '@/i18n/LanguageContext';

const StagesSection = () => {
  const { t } = useLanguage();

  const stages = [
    { number: 1, title: t('stages.1.title'), description: t('stages.1.desc'), icon: Cpu, variant: 'green' as const },
    { number: 2, title: t('stages.2.title'), description: t('stages.2.desc'), icon: Link, variant: 'cyan' as const },
    { number: 3, title: t('stages.3.title'), description: t('stages.3.desc'), icon: Package, variant: 'purple' as const },
    { number: 4, title: t('stages.4.title'), description: t('stages.4.desc'), icon: Search, variant: 'green' as const },
    { number: 5, title: t('stages.5.title'), description: t('stages.5.desc'), icon: Shield, variant: 'orange' as const },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-4 neon-text-cyan">
          {t('stages.title')}
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          {t('stages.subtitle')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {stages.map((stage, index) => (
            <div 
              key={stage.number}
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <StageCard {...stage} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StagesSection;
