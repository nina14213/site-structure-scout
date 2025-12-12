interface BadgePillProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'cyan' | 'purple';
}

const BadgePill = ({ children, variant = 'default' }: BadgePillProps) => {
  const variantClasses = {
    default: 'border-border hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]',
    green: 'border-primary/50 text-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]',
    cyan: 'border-secondary/50 text-secondary hover:shadow-[0_0_15px_hsl(var(--secondary)/0.4)]',
    purple: 'border-accent/50 text-accent hover:shadow-[0_0_15px_hsl(var(--accent)/0.4)]',
  };

  return (
    <span className={`badge-pill ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

export default BadgePill;
