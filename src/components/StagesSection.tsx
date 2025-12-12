import { Cpu, Link, Package, Shield } from 'lucide-react';
import StageCard from './StageCard';

const StagesSection = () => {
  const stages = [
    {
      number: 1,
      title: 'Core Forge',
      description: 'Mapuj kolumny CSV na termy Darwin Core i zbuduj solidny fundament danych.',
      icon: Cpu,
      variant: 'green' as const,
    },
    {
      number: 2,
      title: 'Extension Nexus',
      description: 'Połącz extensions i sprawdź integralność połączeń między danymi.',
      icon: Link,
      variant: 'cyan' as const,
    },
    {
      number: 3,
      title: 'Package Seal',
      description: 'Generuj meta.xml i datapackage.json aby zapieczętować pakiet danych.',
      icon: Package,
      variant: 'purple' as const,
    },
    {
      number: 4,
      title: 'BOSS: Validate',
      description: 'Przejdź finałową walidację GBIF i udowodnij swoje umiejętności!',
      icon: Shield,
      variant: 'orange' as const,
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-4 neon-text-cyan">
          Etapy Misji
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Przejdź przez wszystkie etapy, aby stać się prawdziwym Data Rangerem
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
