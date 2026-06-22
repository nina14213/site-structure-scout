import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, MoveDiagonal2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/accessibility/AccessibilityContext';
import AssistantAvatarArt from '@/components/AssistantAvatarArt';
import { useLanguage } from '@/i18n/LanguageContext';
import type { GameScreen } from '@/hooks/useGameNavigation';
import type { GameState } from '@/hooks/useGameProgress';
import { getAssistantProfile, type AssistantId, type AssistantProfile } from '@/lib/assistants';

type Dock = 'left' | 'right' | 'center';
const IDLE_HELP_DELAY_MS = 120000;
const ASSISTANT_POSITION_KEY = 'dwc-data-quest-assistant-position';
const ASSISTANT_VIEWPORT_MARGIN = 8;

interface AssistantPosition {
  x: number;
  y: number;
}

interface AssistantDragState {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  startX: number;
  startY: number;
  hasMoved: boolean;
}

interface GuideAssistantProps {
  currentScreen: GameScreen;
  currentLevel: number | null;
  gameState: GameState;
}

interface GuideTip {
  title: string;
  body: string;
  badge: string;
}

interface GuideTipKey {
  titleKey: string;
  bodyKey: string;
  badge?: string;
  badgeKey?: string;
  params?: Record<string, string | number>;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

function isAssistantPosition(value: unknown): value is AssistantPosition {
  if (!value || typeof value !== 'object') return false;
  const position = value as Partial<AssistantPosition>;
  return Number.isFinite(position.x) && Number.isFinite(position.y);
}

function readStoredAssistantPosition(): AssistantPosition | null {
  try {
    const raw = localStorage.getItem(ASSISTANT_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isAssistantPosition(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function clampAssistantPosition(position: AssistantPosition, width: number, height: number): AssistantPosition {
  if (typeof window === 'undefined') return position;

  const maxX = Math.max(ASSISTANT_VIEWPORT_MARGIN, window.innerWidth - width - ASSISTANT_VIEWPORT_MARGIN);
  const maxY = Math.max(ASSISTANT_VIEWPORT_MARGIN, window.innerHeight - height - ASSISTANT_VIEWPORT_MARGIN);

  return {
    x: Math.min(Math.max(ASSISTANT_VIEWPORT_MARGIN, position.x), maxX),
    y: Math.min(Math.max(ASSISTANT_VIEWPORT_MARGIN, position.y), maxY),
  };
}

function getDockFromPosition(position: AssistantPosition): Dock {
  if (typeof window === 'undefined') return 'left';
  const third = window.innerWidth / 3;
  if (position.x < third) return 'left';
  if (position.x > third * 2) return 'right';
  return 'center';
}

const tipKey = (key: string): GuideTipKey => ({
  badgeKey: `assistant.tip.${key}.badge`,
  titleKey: `assistant.tip.${key}.title`,
  bodyKey: `assistant.tip.${key}.body`,
});

const translateTip = (t: Translate, tip: GuideTipKey): GuideTip => ({
  badge: tip.badge ?? t(tip.badgeKey ?? '', tip.params),
  title: t(tip.titleKey, tip.params),
  body: t(tip.bodyKey, tip.params),
});

const translateTips = (t: Translate, tips: GuideTipKey[]) => tips.map((tip) => translateTip(t, tip));

const levelTips: Record<number, GuideTipKey[]> = {
  1: [
    tipKey('level1.required'),
    tipKey('level1.mapping'),
  ],
  2: [
    tipKey('level2.event'),
    tipKey('level2.control'),
  ],
  3: [
    tipKey('level3.package'),
    tipKey('level3.structure'),
  ],
  4: [
    tipKey('level4.position'),
    tipKey('level4.taxon'),
  ],
  5: [
    tipKey('level5.validate'),
    tipKey('level5.fix'),
  ],
};

function getTips(
  currentScreen: GameScreen,
  currentLevel: number | null,
  gameState: GameState,
  assistantName: string,
  t: Translate,
): GuideTip[] {
  const playerName = gameState.playerName || 'Data Ranger';
  const completed = gameState.levelsCompleted.length;

  if (currentScreen === 'playing' && currentLevel) {
    return translateTips(t, levelTips[currentLevel] ?? levelTips[1]);
  }

  if (currentScreen === 'quiz') {
    return translateTips(t, [tipKey('quiz.stop'), tipKey('quiz.score')]);
  }

  if (currentScreen === 'schemaMapper') {
    return translateTips(t, [tipKey('mapper.rhythm'), tipKey('mapper.id')]);
  }

  if (currentScreen === 'complete') {
    return translateTips(t, [tipKey('complete.done')]);
  }

  return translateTips(t, [
    {
      badge: `${completed}/5`,
      titleKey: 'assistant.tip.menu.welcome.title',
      bodyKey: 'assistant.tip.menu.welcome.body',
      params: { playerName, assistantName },
    },
    tipKey('menu.continue'),
    tipKey('menu.boss'),
  ]);
}

function getSuggestedDock(currentScreen: GameScreen, currentLevel: number | null): Dock {
  if (currentScreen === 'playing' && currentLevel && currentLevel % 2 === 0) return 'right';
  if (currentScreen === 'quiz') return 'right';
  if (currentScreen === 'schemaMapper') return 'center';
  return 'left';
}

function getIdleTip(currentScreen: GameScreen, currentLevel: number | null, t: Translate): GuideTip {
  if (currentScreen === 'playing' && currentLevel) {
    return translateTip(t, tipKey('idle.playing'));
  }

  if (currentScreen === 'quiz') {
    return translateTip(t, tipKey('idle.quiz'));
  }

  return translateTip(t, tipKey('idle.default'));
}

function AssistantAvatar({ assistantId, reduceMotion }: { assistantId: AssistantId; reduceMotion: boolean }) {
  if (assistantId !== 'octavia') {
    return (
      <AssistantAvatarArt
        assistantId={assistantId}
        className="h-32 w-32 shrink-0 drop-shadow-xl"
        animated
        reduceMotion={reduceMotion}
      />
    );
  }

  const float = reduceMotion
    ? {}
    : {
        y: [0, -5, 0],
        rotate: [-1, 1.5, -1],
        transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' as const },
      };

  const tentacleMotion = (delay: number, rotate: number) => reduceMotion
    ? {}
    : {
        rotate: [rotate - 5, rotate + 6, rotate - 5],
        transition: { duration: 2.8, delay, repeat: Infinity, ease: 'easeInOut' as const },
      };

  const tentacles = [
    { d: 'M68 90 C55 102 46 115 37 135', rotate: -4, width: 12 },
    { d: 'M74 94 C65 111 64 129 66 148', rotate: -1, width: 12 },
    { d: 'M82 94 C91 111 95 128 99 147', rotate: 1, width: 12 },
    { d: 'M88 90 C104 101 116 116 127 135', rotate: 4, width: 12 },
    { d: 'M60 84 C43 87 29 96 18 109', rotate: -6, width: 11 },
    { d: 'M96 84 C113 87 126 97 137 110', rotate: 6, width: 11 },
    { d: 'M61 90 C43 108 31 112 16 106', rotate: -7, width: 11 },
    { d: 'M95 90 C114 109 128 113 142 106', rotate: 7, width: 11 },
  ];

  return (
    <motion.svg
      viewBox="0 0 156 154"
      className="h-32 w-32 shrink-0 drop-shadow-xl"
      animate={float}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="octoBody" cx="35%" cy="22%" r="80%">
          <stop offset="0%" stopColor="#fde2f3" />
          <stop offset="45%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#c026d3" />
        </radialGradient>
        <linearGradient id="octoTentacle" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="55%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a21caf" />
        </linearGradient>
      </defs>

      <ellipse cx="78" cy="145" rx="48" ry="7" fill="#581c87" opacity="0.12" />

      {tentacles.map((tentacle, index) => (
        <motion.g
          key={tentacle.d}
          style={{ transformOrigin: '78px 88px' }}
          animate={tentacleMotion(index * 0.08, tentacle.rotate)}
        >
          <path
            d={tentacle.d}
            fill="none"
            stroke="url(#octoTentacle)"
            strokeLinecap="round"
            strokeWidth={tentacle.width}
          />
          <path
            d={tentacle.d}
            fill="none"
            stroke="#fbcfe8"
            strokeDasharray="1 15"
            strokeLinecap="round"
            strokeWidth="4"
            opacity="0.9"
          />
        </motion.g>
      ))}

      <path
        d="M38 62 C38 29 56 13 78 13 C102 13 118 31 118 62 C118 92 102 107 78 107 C54 107 38 92 38 62Z"
        fill="url(#octoBody)"
        stroke="#fce7f3"
        strokeWidth="5"
      />
      <path
        d="M55 32 C64 20 84 18 99 29"
        fill="none"
        stroke="#fff7fb"
        strokeLinecap="round"
        strokeWidth="6"
        opacity="0.6"
      />

      <ellipse cx="63" cy="58" rx="12" ry="14" fill="white" />
      <ellipse cx="93" cy="58" rx="12" ry="14" fill="white" />
      <circle cx="65" cy="61" r="6" fill="#111827" />
      <circle cx="91" cy="61" r="6" fill="#111827" />
      <circle cx="67" cy="58" r="2" fill="white" />
      <circle cx="93" cy="58" r="2" fill="white" />
      <ellipse cx="52" cy="73" rx="8" ry="5" fill="#fb7185" opacity="0.72" />
      <ellipse cx="104" cy="73" rx="8" ry="5" fill="#fb7185" opacity="0.72" />
      <path
        d="M68 78 C73 85 84 85 89 78"
        fill="none"
        stroke="#4c1d95"
        strokeLinecap="round"
        strokeWidth="4"
      />

      <motion.path
        d="M119 33 C130 26 140 31 142 42"
        fill="none"
        stroke="#f9a8d4"
        strokeLinecap="round"
        strokeWidth="8"
        animate={reduceMotion ? {} : { rotate: [-3, 8, -3] }}
        style={{ transformOrigin: '119px 36px' }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx="143" cy="43" r="5" fill="#f9a8d4" />
    </motion.svg>
  );
}

function FrameHugTentacles({
  dock,
  reduceMotion,
  assistant,
}: {
  dock: Dock;
  reduceMotion: boolean;
  assistant: AssistantProfile;
}) {
  const originX = dock === 'right' ? 276 : dock === 'center' ? 180 : 84;
  const leftPath = `M${originX - 16} 28 C${originX - 68} 28 54 34 28 68 C8 94 18 132 17 170 C17 188 32 194 54 184`;
  const rightPath = `M${originX + 16} 28 C${originX + 70} 28 306 36 334 70 C354 96 342 134 343 170 C344 188 328 194 306 184`;
  const bottomPath = `M${originX} 34 C${originX - 8} 94 ${originX + 36} 154 188 178 C230 192 270 184 316 160`;
  const wave = reduceMotion
    ? {}
    : {
        rotate: [-0.5, 0.8, -0.5],
        transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' as const },
      };

  const renderTentacle = (path: string, opacity = 0.95) => (
    <>
      <path
        d={path}
        fill="none"
        stroke={assistant.frame.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="11"
        opacity={opacity}
      />
      <path
        d={path}
        fill="none"
        stroke={assistant.frame.highlight}
        strokeDasharray="1 16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        opacity="0.95"
      />
    </>
  );

  return (
    <motion.svg
      viewBox="0 0 360 205"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -inset-x-4 -top-8 -bottom-4 z-0 h-[calc(100%+3rem)] w-[calc(100%+2rem)] overflow-visible"
      animate={wave}
      aria-hidden="true"
    >
      {renderTentacle(leftPath)}
      {renderTentacle(rightPath)}
      {renderTentacle(bottomPath, 0.72)}
    </motion.svg>
  );
}

function FrameFrontTentacles({
  dock,
  reduceMotion,
  assistant,
}: {
  dock: Dock;
  reduceMotion: boolean;
  assistant: AssistantProfile;
}) {
  const originX = dock === 'right' ? 276 : dock === 'center' ? 180 : 84;
  const topGrip = `M${originX - 34} 25 C${originX - 18} 15 ${originX + 18} 15 ${originX + 34} 25`;
  const leftGrip = 'M7 88 C1 104 5 122 16 138 M17 80 C27 93 25 108 12 121';
  const rightGrip = 'M353 88 C359 104 355 122 344 138 M343 80 C333 93 335 108 348 121';
  const bottomGrip = 'M82 199 C112 185 140 190 162 204 M198 204 C222 190 250 185 278 199';
  const wave = reduceMotion
    ? {}
    : {
        y: [0, 2, 0],
        transition: { duration: 3.1, repeat: Infinity, ease: 'easeInOut' as const },
      };

  const renderTentacle = (path: string, width = 10) => (
    <>
      <path
        d={path}
        fill="none"
        stroke={assistant.frame.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={width}
      />
      <path
        d={path}
        fill="none"
        stroke={assistant.frame.highlight}
        strokeDasharray="1 15"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
        opacity="0.9"
      />
    </>
  );

  return (
    <motion.svg
      viewBox="0 0 360 205"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -inset-x-4 -top-8 -bottom-4 z-[15] h-[calc(100%+3rem)] w-[calc(100%+2rem)] overflow-visible"
      animate={wave}
      aria-hidden="true"
    >
      {renderTentacle(topGrip, 9)}
      {renderTentacle(leftGrip)}
      {renderTentacle(rightGrip)}
      {renderTentacle(bottomGrip, 8)}
    </motion.svg>
  );
}

export default function GuideAssistant({ currentScreen, currentLevel, gameState }: GuideAssistantProps) {
  const { settings } = useAccessibility();
  const { t } = useLanguage();
  const reduceMotion = settings.reduceMotion;
  const assistant = getAssistantProfile(gameState.assistantId);
  const assistantName = t(assistant.nameKey);
  const tips = useMemo(() => getTips(currentScreen, currentLevel, gameState, assistantName, t), [
    currentScreen,
    currentLevel,
    gameState,
    assistantName,
    t,
  ]);
  const [tipIndex, setTipIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [idleNudge, setIdleNudge] = useState(false);
  const [manualDock, setManualDock] = useState<Dock | null>(null);
  const [customPosition, setCustomPosition] = useState<AssistantPosition | null>(readStoredAssistantPosition);
  const [isDragging, setIsDragging] = useState(false);
  const assistantRef = useRef<HTMLElement | null>(null);
  const dragStateRef = useRef<AssistantDragState | null>(null);
  const suppressClickRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const suggestedDock = getSuggestedDock(currentScreen, currentLevel);
  const dock = customPosition ? getDockFromPosition(customPosition) : manualDock ?? suggestedDock;
  const tip = tips[tipIndex % tips.length];
  const idleTip = getIdleTip(currentScreen, currentLevel, t);
  const activeTip = idleNudge ? idleTip : tip;
  const contextKey = `${assistant.id}-${currentScreen}-${currentLevel ?? 'none'}-${gameState.currentLevel}-${gameState.levelsCompleted.join('.')}`;
  const assistantPositionStyle = customPosition ? { left: customPosition.x, top: customPosition.y } : undefined;

  useEffect(() => {
    setTipIndex(0);
    setExpanded(true);
    setIdleNudge(false);
    setManualDock(null);
  }, [contextKey]);

  useEffect(() => {
    try {
      if (customPosition) {
        localStorage.setItem(ASSISTANT_POSITION_KEY, JSON.stringify(customPosition));
      } else {
        localStorage.removeItem(ASSISTANT_POSITION_KEY);
      }
    } catch {
      // Position persistence is optional; dragging should still work without storage.
    }
  }, [customPosition]);

  useEffect(() => {
    const handleResize = () => {
      setCustomPosition((position) => {
        if (!position) return null;
        const rect = assistantRef.current?.getBoundingClientRect();
        return clampAssistantPosition(position, rect?.width ?? 368, rect?.height ?? 280);
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;

      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (!drag.hasMoved && distance < 4) return;

      drag.hasMoved = true;
      event.preventDefault();
      setCustomPosition(clampAssistantPosition({
        x: event.clientX - drag.offsetX,
        y: event.clientY - drag.offsetY,
      }, drag.width, drag.height));
    };

    const stopDragging = () => {
      if (dragStateRef.current?.hasMoved) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
      dragStateRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [isDragging]);

  useEffect(() => {
    const clearIdleTimer = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const startIdleTimer = () => {
      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        setIdleNudge(true);
        setExpanded(true);
        setManualDock(null);
      }, IDLE_HELP_DELAY_MS);
    };

    const handleActivity = (event: Event) => {
      if (event.type !== 'pointermove') {
        setIdleNudge(false);
      }
      startIdleTimer();
    };

    const events: Array<keyof WindowEventMap> = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
    startIdleTimer();

    return () => {
      clearIdleTimer();
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
    };
  }, [currentScreen, currentLevel]);

  const startDragging = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const node = assistantRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    dragStateRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      startX: event.clientX,
      startY: event.clientY,
      hasMoved: false,
    };

    setManualDock(null);
    setIsDragging(true);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();

    const node = assistantRef.current;
    const rect = node?.getBoundingClientRect();

    if (event.key === 'Home') {
      setManualDock(null);
      setCustomPosition(null);
      return;
    }

    const step = event.shiftKey ? 48 : 16;
    const width = rect?.width ?? 368;
    const height = rect?.height ?? 280;
    const fallbackPosition = rect ? { x: rect.left, y: rect.top } : { x: ASSISTANT_VIEWPORT_MARGIN, y: ASSISTANT_VIEWPORT_MARGIN };

    setManualDock(null);
    setCustomPosition((position) => {
      const base = position ?? fallbackPosition;
      const next = {
        x: base.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
        y: base.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0),
      };

      return clampAssistantPosition(next, width, height);
    });
  };

  return (
    <motion.aside
      ref={assistantRef}
      className={cn(
        'fixed z-[65] max-w-[calc(100vw-1rem)]',
        !customPosition && dock === 'right' && 'bottom-24 right-3 md:right-5',
        !customPosition && dock === 'left' && 'bottom-6 left-3 md:left-5',
        !customPosition && dock === 'center' && 'bottom-6 left-1/2 -translate-x-1/2',
      )}
      style={assistantPositionStyle}
      onPointerDown={startDragging}
      onClickCapture={handleClickCapture}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      aria-label={t('assistant.asideAria', { name: assistantName })}
    >
      <div className={cn('relative cursor-grab touch-none pt-20 active:cursor-grabbing', isDragging && 'cursor-grabbing')}>
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label={t('assistant.control.collapse')}
            className={cn(
              'absolute -top-3 z-20 rounded-full focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              dock === 'right' ? 'right-8' : dock === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8',
            )}
          >
            <AssistantAvatar assistantId={assistant.id} reduceMotion={reduceMotion} />
          </button>
        )}

        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={t('assistant.control.expand')}
            className={cn(
              'absolute bottom-0 z-20 rounded-full focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              dock === 'right' ? 'right-0' : dock === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
            )}
          >
            <AssistantAvatar assistantId={assistant.id} reduceMotion={reduceMotion} />
          </button>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              key={contextKey}
              initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="relative w-[min(calc(100vw-2rem),23rem)]"
            >
              <FrameHugTentacles dock={dock} reduceMotion={reduceMotion} assistant={assistant} />

              <div
                className={cn(
                  'relative z-10 overflow-hidden rounded-lg border-2 bg-card p-4 pt-12 text-card-foreground shadow-2xl shadow-black/25 backdrop-blur',
                  assistant.frame.border,
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge className={assistant.badgeClass}>
                        {activeTip.badge}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {assistantName}
                      </span>
                    </div>
                    <h2 className="text-base font-bold leading-tight text-foreground">{activeTip.title}</h2>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded(false)}
                    aria-label={t('assistant.control.closeTip')}
                    className="h-8 w-8 shrink-0"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">{activeTip.body}</p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-1" aria-hidden="true">
                    {tips.map((_, index) => (
                      <span
                        key={index}
                        className={cn('h-1.5 w-5 rounded-full', index === tipIndex ? 'bg-pink-500' : 'bg-muted')}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onKeyDown={moveWithKeyboard}
                      aria-label={t('assistant.control.move')}
                      className={cn('h-8 w-8 cursor-grab touch-none active:cursor-grabbing', isDragging && 'cursor-grabbing')}
                    >
                      <MoveDiagonal2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setIdleNudge(false);
                        setTipIndex((index) => (index + 1) % tips.length);
                      }}
                      className={cn('h-8 gap-1', assistant.buttonClass)}
                    >
                      {t('assistant.control.next')}
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>

              <FrameFrontTentacles dock={dock} reduceMotion={reduceMotion} assistant={assistant} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
