import AssistantAvatarArt from '@/components/AssistantAvatarArt';
import type { AssistantId } from '@/lib/assistants';

interface MascotIconProps {
  className?: string;
  assistantId?: AssistantId;
}

const MascotIcon = ({ className = '', assistantId = 'octavia' }: MascotIconProps) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} aria-hidden="true">
      <div className="float pulse-glow rounded-full bg-muted/30 p-4">
        <AssistantAvatarArt assistantId={assistantId} className="h-24 w-24 sm:h-28 sm:w-28" />
      </div>
      <div className="absolute -bottom-2 left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-primary/20 blur-xl" />
    </div>
  );
};

export default MascotIcon;
