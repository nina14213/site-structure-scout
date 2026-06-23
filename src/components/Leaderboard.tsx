import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const topRangers = [
    { rank: 1, name: 'DataMaster_PL', score: 2450, icon: Trophy },
    { rank: 2, name: 'BioRanger99', score: 2180, icon: Medal },
    { rank: 3, name: 'GBIFHunter', score: 1920, icon: Award },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-2xl mb-6 text-center text-foreground dark:neon-text">
        Top Rangers
      </h3>
      
      <div className="space-y-3">
        {topRangers.map((ranger) => {
          const IconComponent = ranger.icon;
          const rankColors = {
            1: 'text-amber-700 dark:text-yellow-400',
            2: 'text-slate-600 dark:text-gray-300',
            3: 'text-orange-700 dark:text-amber-600',
          };
          
          return (
            <div 
              key={ranger.rank}
              className="flex items-center gap-4 p-3 rounded-lg border border-border/80 bg-white/70 hover:bg-emerald-100/80 dark:border-transparent dark:bg-muted/30 dark:hover:bg-muted/50 transition-colors"
            >
              <div className={`${rankColors[ranger.rank as keyof typeof rankColors]}`}>
                <IconComponent size={24} />
              </div>
              <span className="font-display text-lg flex-1 text-foreground">{ranger.name}</span>
              <span className="text-primary font-black">{ranger.score.toLocaleString()} pts</span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-muted-foreground text-sm mt-6">
        Bądź pierwszy na liście!
      </p>
    </div>
  );
};

export default Leaderboard;
