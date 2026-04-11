/**
 * @file HelpTooltip.tsx
 * @description Ikonka "?" z tooltipem wyjaśniającym "Po co mi to?"
 */

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HelpTooltipProps {
  text: string;
  className?: string;
}

export default function HelpTooltip({ text, className = "" }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-full hover:bg-primary/10"
        aria-label="Pomoc"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground leading-relaxed"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
