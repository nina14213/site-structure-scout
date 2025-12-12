import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const topRangers = [
    { rank: 1, name: 'DataMaster_PL', score: 2450, icon: Trophy },
    { rank: 2, name: 'BioRanger99', score: 2180, icon: Medal },
    { rank: 3, name: 'GBIFHunter', score: 1920, icon: Award },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-2xl mb-6 text-center neon-text">
        Top Rangers
      </h3>
      
      <div className="space-y-3">
        {topRangers.map((ranger) => {
          const IconComponent = ranger.icon;
          const rankColors = {
            1: 'text-yellow-400',
            2: 'text-gray-300',
            3: 'text-amber-600',
          };
          
          return (
            <div 
              key={ranger.rank}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`${rankColors[ranger.rank as keyof typeof rankColors]}`}>
                <IconComponent size={24} />
              </div>
              <span className="font-display text-lg flex-1">{ranger.name}</span>
              <span className="text-primary font-bold">{ranger.score.toLocaleString()} pts</span>
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
