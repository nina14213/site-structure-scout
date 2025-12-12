import { LucideIcon } from 'lucide-react';

interface StageCardProps {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: 'green' | 'cyan' | 'purple' | 'orange';
}

const StageCard = ({ number, title, description, icon: Icon, variant = 'green' }: StageCardProps) => {
  const variantStyles = {
    green: {
      border: 'hover:border-primary/50',
      glow: 'group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]',
      iconBg: 'bg-primary/20 text-primary',
      number: 'text-primary',
    },
    cyan: {
      border: 'hover:border-secondary/50',
      glow: 'group-hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)]',
      iconBg: 'bg-secondary/20 text-secondary',
      number: 'text-secondary',
    },
    purple: {
      border: 'hover:border-accent/50',
      glow: 'group-hover:shadow-[0_0_30px_hsl(var(--accent)/0.3)]',
      iconBg: 'bg-accent/20 text-accent',
      number: 'text-accent',
    },
    orange: {
      border: 'hover:border-neon-orange/50',
      glow: 'group-hover:shadow-[0_0_30px_hsl(25_100%_55%/0.3)]',
      iconBg: 'bg-neon-orange/20 text-neon-orange',
      number: 'text-neon-orange',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`group stage-card ${styles.border} ${styles.glow}`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={28} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-display text-sm ${styles.number} opacity-70`}>
              STAGE {String(number).padStart(2, '0')}
            </span>
          </div>
          <h3 className="font-display text-xl mb-2 text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default StageCard;
