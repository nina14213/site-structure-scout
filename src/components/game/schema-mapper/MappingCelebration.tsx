/**
 * @file MappingCelebration.tsx
 * @description Mini-celebracja po zmapowaniu pierwszej kolumny.
 */

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface MappingCelebrationProps {
  mappingsCount: number;
}

export default function MappingCelebration({ mappingsCount }: MappingCelebrationProps) {
  const celebratedRef = useRef(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Celebrate on first mapping
    if (!celebratedRef.current && prevCountRef.current === 0 && mappingsCount === 1) {
      celebratedRef.current = true;
      toast("🎉 Świetnie! Pierwsze pole zmapowane!", {
        description: "Tak trzymaj — reszta pójdzie łatwiej!",
        duration: 4000,
      });
    }
    // Celebrate milestones
    if (mappingsCount === 5 && prevCountRef.current < 5) {
      toast("⭐ Super! Już 5 pól zmapowanych!", { duration: 3000 });
    }
    if (mappingsCount === 10 && prevCountRef.current < 10) {
      toast("🚀 Wow, 10 pól! Jesteś mistrzem mapowania!", { duration: 3000 });
    }
    prevCountRef.current = mappingsCount;
  }, [mappingsCount]);

  return null;
}
