interface MascotIconProps {
  className?: string;
}

const MascotIcon = ({ className = "" }: MascotIconProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="text-8xl float pulse-glow rounded-full p-4 bg-muted/30">
        🦎
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-primary/20 rounded-full blur-xl" />
    </div>
  );
};

export default MascotIcon;
