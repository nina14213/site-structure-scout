import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlossaryTermProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export default function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="font-semibold text-primary underline decoration-dotted decoration-primary/40 underline-offset-2 cursor-help"
      >
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[10010] w-56 px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground"
          >
            <p className="font-semibold text-primary mb-0.5">{term}</p>
            <p className="leading-relaxed">{definition}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
