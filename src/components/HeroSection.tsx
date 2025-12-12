import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from './ui/button';
import MascotIcon from './MascotIcon';
import BadgePill from './BadgePill';

interface HeroSectionProps {
  onStartGame: (playerName: string) => void;
}

const HeroSection = ({ onStartGame }: HeroSectionProps) => {
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleStartClick = () => {
    if (showNameInput && playerName.trim()) {
      onStartGame(playerName);
    } else {
      setShowNameInput(true);
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <MascotIcon className="mb-8 flex justify-center" />
        
        <h1 className="font-display text-5xl md:text-7xl mb-6 neon-text animate-fade-in">
          DwC Data Quest
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Zostań Data Rangerem i uratuj dane z kolekcji AMUNATCOLL przed Chaos Validator GBIF!
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-10 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <BadgePill variant="green">Darwin Core</BadgePill>
          <BadgePill variant="cyan">GBIF</BadgePill>
          <BadgePill variant="purple">DwC-DP</BadgePill>
        </div>
        
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {showNameInput ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="text"
                placeholder="Twoje imię (Data Ranger)"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full sm:flex-1 h-14 px-6 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground font-body text-lg transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
              />
              <Button 
                variant="hero" 
                size="xl"
                onClick={handleStartClick}
                disabled={!playerName.trim()}
                className="w-full sm:w-auto"
              >
                <Play size={20} />
                Rozpocznij Grę
              </Button>
            </div>
          ) : (
            <Button 
              variant="hero" 
              size="xl"
              onClick={handleStartClick}
              className="animate-glow-pulse"
            >
              Rozpocznij Misję
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
