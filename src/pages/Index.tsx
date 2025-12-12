import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import HeroSection from '@/components/HeroSection';
import StagesSection from '@/components/StagesSection';
import Leaderboard from '@/components/Leaderboard';
import ResourcesSection from '@/components/ResourcesSection';
import Footer from '@/components/Footer';

const Index = () => {
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState<string | null>(null);

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    toast({
      title: `Witaj, ${name}! 🦎`,
      description: "Twoja misja Data Rangera właśnie się rozpoczęła!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onStartGame={handleStartGame} />
      
      <StagesSection />
      
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <Leaderboard />
        </div>
      </section>
      
      <ResourcesSection />
      
      <Footer />
    </div>
  );
};

export default Index;
