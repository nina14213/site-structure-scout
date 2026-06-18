import { motion } from 'framer-motion';

type AnimationType = 'drag-drop' | 'auto-map' | 'checkmark' | 'download' | 'file-to-table';

interface TutorialAnimationProps {
  type: AnimationType;
}

export default function TutorialAnimation({ type }: TutorialAnimationProps) {
  if (type === 'file-to-table') {
    return (
      <div className="relative h-16 my-2 rounded-lg bg-muted/40 border border-border overflow-hidden flex items-center justify-center gap-3">
        {/* File icon */}
        <motion.div
          className="flex items-center gap-1 text-muted-foreground"
          animate={{ x: [0, 8], opacity: [1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <span className="text-[9px] font-medium">CSV</span>
        </motion.div>
        {/* Arrow */}
        <motion.svg
          className="w-6 h-4 text-primary"
          viewBox="0 0 24 16"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <path d="M0 8h20M16 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </motion.svg>
        {/* Table icon */}
        <motion.div
          className="flex items-center gap-1 text-primary"
          animate={{ x: [-8, 0], opacity: [0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
          </svg>
          <span className="text-[9px] font-medium">DwC</span>
        </motion.div>
      </div>
    );
  }

  if (type === 'drag-drop') {
    return (
      <div className="relative h-20 my-2 rounded-xl bg-muted/40 border border-border overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-border/60 bg-background/50" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-primary/5" />

        <motion.div
          className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-background text-foreground text-[10px] font-semibold border border-border shadow-sm z-10"
          animate={{
            x: [0, 92, 92],
            y: [0, -8, -8],
            scale: [1, 1.04, 0.98],
          }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6 }}
        >
          Specimen
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-16 -translate-y-1/2 flex items-center gap-1 text-primary z-0"
          animate={{ x: [0, 26, 52], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6 }}
        >
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary/40" />
          <svg className="w-5 h-3" viewBox="0 0 20 12"><path d="M0 6h16M12 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
        </motion.div>

        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold border border-primary/30"
          animate={{
            scale: [1, 1.03, 1],
            boxShadow: [
              '0 0 0 rgba(59,130,246,0)',
              '0 0 0 6px rgba(59,130,246,0.10)',
              '0 0 0 rgba(59,130,246,0)',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6 }}
        >
          scientificName
        </motion.div>
      </div>
    );
  }

  if (type === 'auto-map') {
    return (
      <div className="relative h-14 my-2 rounded-lg bg-muted/40 border border-border overflow-hidden flex items-center justify-center gap-3">
        <motion.div
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[10px] font-medium"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✨ Auto-detect
        </motion.div>
        <motion.div
          className="flex gap-1"
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, delay: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
        >
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              animate={{ scale: [0, 1] }}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.2, repeat: Infinity, repeatDelay: 1.5 }}
            />
          ))}
        </motion.div>
        <motion.span
          className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium"
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.3, delay: 1.6, repeat: Infinity, repeatDelay: 1.5 }}
        >
          5 mapped!
        </motion.span>
      </div>
    );
  }

  if (type === 'checkmark') {
    return (
      <div className="relative h-14 my-2 rounded-lg bg-muted/40 border border-border overflow-hidden flex items-center justify-center gap-2">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <div className="px-2 py-1 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
            ✅ Event
          </div>
          <div className="px-2 py-1 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
            ✅ Occurrence
          </div>
          <div className="px-2 py-1 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
            🟠 Location
          </div>
        </motion.div>
      </div>
    );
  }

  if (type === 'download') {
    return (
      <div className="relative h-14 my-2 rounded-lg bg-muted/40 border border-border overflow-hidden flex items-center justify-center">
        <motion.div
          className="flex items-center gap-2 text-primary"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /><path d="M5 20h14" /></svg>
          <span className="text-[10px] font-medium">data-package.zip</span>
        </motion.div>
      </div>
    );
  }

  return null;
}
