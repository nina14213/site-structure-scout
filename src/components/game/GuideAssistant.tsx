import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, HelpCircle, MoveDiagonal2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/accessibility/AccessibilityContext';
import type { GameScreen } from '@/hooks/useGameNavigation';
import type { GameState } from '@/hooks/useGameProgress';

type Dock = 'left' | 'right' | 'center';

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

const levelTips: Record<number, GuideTip[]> = {
  1: [
    {
      badge: 'Modul 1',
      title: 'Najpierw wymagane pola',
      body: 'W Core Forge celuj w pola wymagane. Gdy wszystkie kluczowe terminy Darwin Core sa wypelnione, dopiero wtedy warto dopracowac opcjonalne.',
    },
    {
      badge: 'Macka mapowania',
      title: 'Kolumna do terminu',
      body: 'Jesli utkniesz, wybierz kolumne po znaczeniu danych, nie po samej nazwie. scientificName zwykle zdradza sie lacinskimi nazwami.',
    },
  ],
  2: [
    {
      badge: 'Modul 2',
      title: 'Pilnuj eventID',
      body: 'W sieci rozszerzen najczesciej wszystko spina eventID. Najpierw dopasuj wydarzenia, potem uzupelnij occurrence.',
    },
    {
      badge: 'Kontrola',
      title: 'Bledne pola czysc selektywnie',
      body: 'Po walidacji popraw tylko czerwone pola. Nie kasuj dobrych odpowiedzi, bo tracisz rytm pracy.',
    },
  ],
  3: [
    {
      badge: 'Modul 3',
      title: 'Pakowanie danych',
      body: 'Najpierw wygeneruj meta.xml i datapackage.json, potem sprawdz czy opisy plikow pasuja do tego, co zbudowales w poprzednich modulach.',
    },
    {
      badge: 'Porzadek',
      title: 'Nazwy i struktura',
      body: 'Pakiet danych lubi konsekwencje: jedna tabela glowna, jasne rozszerzenia i metadane, ktore tlumacza calosc bez zgadywania.',
    },
  ],
  4: [
    {
      badge: 'Modul 4',
      title: 'Nie ufaj pozycji odpowiedzi',
      body: 'W Lowcy Gatunkow odpowiedzi sa mieszane. Patrz na accepted name, synonym i kingdom, nie na to, gdzie stoi przycisk.',
    },
    {
      badge: 'GBIF',
      title: 'Status taksonu jest kluczem',
      body: 'Jesli nazwa jest synonimem, wybierz nazwe akceptowana. Jesli jest poprawna, czasem najlepsza odpowiedz wyglada podejrzanie zwyczajnie.',
    },
  ],
  5: [
    {
      badge: 'BOSS',
      title: 'Waliduj spokojnie',
      body: 'BOSS odblokowuje sie dopiero po modulach 1-4. Gdy tu jestes, czytaj bledy jak liste napraw, nie jak wyrok.',
    },
    {
      badge: 'Final',
      title: 'Napraw jedno po drugim',
      body: 'Najpierw identyfikatory i wymagane pola, potem formaty dat, a na koncu szczegoly taksonomii. To najkrotsza droga przez walidacje.',
    },
  ],
};

function getTips(currentScreen: GameScreen, currentLevel: number | null, gameState: GameState): GuideTip[] {
  const playerName = gameState.playerName || 'Data Ranger';
  const completed = gameState.levelsCompleted.length;

  if (currentScreen === 'playing' && currentLevel) {
    return levelTips[currentLevel] ?? levelTips[1];
  }

  if (currentScreen === 'quiz') {
    return [
      {
        badge: 'Quiz',
        title: 'Krótki przystanek',
        body: 'Odpowiedz na pytania po module. Po zamknieciu quizu gra sprawdzi, czy kolejny modul jest odblokowany.',
      },
      {
        badge: 'Punkty',
        title: 'Wynik zapisuje sie od razu',
        body: 'Twoje punkty trafiaja na liste Top Rangers na biezaco, wiec po powrocie do menu widzisz aktualny stan.',
      },
    ];
  }

  if (currentScreen === 'schemaMapper') {
    return [
      {
        badge: 'Mapper',
        title: 'Wlasne dane, ten sam rytm',
        body: 'Zaimportuj plik, przypisz wymagane pola i dopiero potem eksportuj. Jesli cos nie pasuje, zapis postepu pozwala wrocic bez paniki.',
      },
      {
        badge: 'ID',
        title: 'Identyfikatory sa fundamentem',
        body: 'Kazdy rekord powinien miec stabilne ID. Generator ID pomaga, gdy surowe dane go nie maja.',
      },
    ];
  }

  if (currentScreen === 'complete') {
    return [
      {
        badge: 'Meta',
        title: 'Misja zamknieta',
        body: 'Mozesz przejrzec odznaki, wynik i restartowac gre. Jesli testujesz sciezki, reset daje czysty zapis.',
      },
    ];
  }

  return [
    {
      badge: `${completed}/5`,
      title: `Hej ${playerName}, jestem Różowa Ośmiorniczka`,
      body: 'Kliknij kafelek modulu, aby wejsc do zadania. Pasek pokazuje postep, zielony znak oznacza ukonczenie, a klodka blokade.',
    },
    {
      badge: 'Menu',
      title: 'Kontynuacja bez zgadywania',
      body: 'Przycisk kontynuacji prowadzi do ostatniego sensownego miejsca. Klikniecie siebie na Top Rangers tylko pokazuje profil i postepy w menu.',
    },
    {
      badge: 'BOSS',
      title: 'Final pilnuje zasad',
      body: 'BOSS: Walidacja zostaje zablokowany, dopoki moduly 1-4 nie sa ukonczone. To chroni gre przed skrotami.',
    },
  ];
}

function getSuggestedDock(currentScreen: GameScreen, currentLevel: number | null): Dock {
  if (currentScreen === 'playing' && currentLevel && currentLevel % 2 === 0) return 'right';
  if (currentScreen === 'quiz') return 'right';
  if (currentScreen === 'schemaMapper') return 'center';
  return 'left';
}

function AssistantAvatar({ reduceMotion }: { reduceMotion: boolean }) {
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

export default function GuideAssistant({ currentScreen, currentLevel, gameState }: GuideAssistantProps) {
  const { settings } = useAccessibility();
  const reduceMotion = settings.reduceMotion;
  const tips = useMemo(() => getTips(currentScreen, currentLevel, gameState), [
    currentScreen,
    currentLevel,
    gameState,
  ]);
  const [tipIndex, setTipIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [manualDock, setManualDock] = useState<Dock | null>(null);
  const suggestedDock = getSuggestedDock(currentScreen, currentLevel);
  const dock = manualDock ?? suggestedDock;
  const tip = tips[tipIndex % tips.length];
  const contextKey = `${currentScreen}-${currentLevel ?? 'none'}-${gameState.currentLevel}-${gameState.levelsCompleted.join('.')}`;

  useEffect(() => {
    setTipIndex(0);
    setExpanded(true);
    setHidden(false);
    setManualDock(null);
  }, [contextKey]);

  const cycleDock = () => {
    const order: Dock[] = ['left', 'center', 'right'];
    const current = order.indexOf(dock);
    setManualDock(order[(current + 1) % order.length]);
  };

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => {
          setHidden(false);
          setExpanded(true);
        }}
        aria-label="Pokaz asystenta gry"
        className={cn(
          'fixed z-[65] flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-200 bg-pink-600 text-white shadow-xl shadow-black/25 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          dock === 'right' && 'bottom-24 right-4',
          dock === 'left' && 'bottom-6 left-4',
          dock === 'center' && 'bottom-6 left-1/2 -translate-x-1/2',
        )}
      >
        <HelpCircle className="h-6 w-6" aria-hidden="true" />
      </button>
    );
  }

  return (
    <motion.aside
      className={cn(
        'fixed z-[65] max-w-[calc(100vw-1rem)]',
        dock === 'right' && 'bottom-24 right-3 md:right-5',
        dock === 'left' && 'bottom-6 left-3 md:left-5',
        dock === 'center' && 'bottom-6 left-1/2 -translate-x-1/2',
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      aria-label="Animowany asystent gry"
    >
      <div className="relative pt-20">
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Zwin asystenta"
            className={cn(
              'absolute -top-3 z-20 rounded-full focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              dock === 'right' ? 'right-8' : dock === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8',
            )}
          >
            <AssistantAvatar reduceMotion={reduceMotion} />
          </button>
        )}

        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Rozwin asystenta"
            className={cn(
              'absolute bottom-0 z-20 rounded-full focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              dock === 'right' ? 'right-0' : dock === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
            )}
          >
            <AssistantAvatar reduceMotion={reduceMotion} />
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
              className="relative w-[min(calc(100vw-2rem),23rem)] overflow-visible rounded-lg border-2 border-pink-300/80 bg-card/95 p-4 pt-12 text-card-foreground shadow-2xl shadow-black/25 backdrop-blur"
            >
              <div className="relative z-10 mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge className="border-pink-500/40 bg-pink-500/15 text-pink-700 dark:text-pink-300">
                      {tip.badge}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      Ośmiorniczka
                    </span>
                  </div>
                  <h2 className="text-base font-bold leading-tight text-foreground">{tip.title}</h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setHidden(true)}
                  aria-label="Schowaj asystenta"
                  className="h-8 w-8 shrink-0"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>

              <div className="relative z-10 mt-4 flex items-center justify-between gap-2">
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
                    onClick={cycleDock}
                    aria-label="Przenies asystenta"
                    className="h-8 w-8"
                  >
                    <MoveDiagonal2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setTipIndex((index) => (index + 1) % tips.length)}
                    className="h-8 gap-1 bg-pink-700 text-white hover:bg-pink-800"
                  >
                    Dalej
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
