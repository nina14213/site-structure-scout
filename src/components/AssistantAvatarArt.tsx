import { motion } from 'framer-motion';
import type { AssistantId } from '@/lib/assistants';

interface AssistantAvatarArtProps {
  assistantId?: AssistantId;
  className?: string;
  reduceMotion?: boolean;
  animated?: boolean;
}

const floatAnimation = (animated: boolean, reduceMotion: boolean) =>
  animated && !reduceMotion
    ? {
        y: [0, -5, 0],
        rotate: [-1, 1.5, -1],
        transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {};

const wiggleAnimation = (animated: boolean, reduceMotion: boolean, delay: number, rotate: number) =>
  animated && !reduceMotion
    ? {
        rotate: [rotate - 4, rotate + 5, rotate - 4],
        transition: { duration: 2.8, delay, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {};

function OctaviaArt({ className, animated = false, reduceMotion = false }: AssistantAvatarArtProps) {
  const tentacles = [
    { d: 'M74 101 C58 116 50 132 41 153', rotate: -4, width: 12 },
    { d: 'M83 107 C75 124 75 141 78 160', rotate: -1, width: 12 },
    { d: 'M97 107 C106 124 107 141 103 160', rotate: 1, width: 12 },
    { d: 'M106 101 C124 116 132 132 140 153', rotate: 4, width: 12 },
    { d: 'M70 96 C49 99 32 108 20 124', rotate: -6, width: 11 },
    { d: 'M110 96 C131 99 148 108 160 124', rotate: 6, width: 11 },
    { d: 'M72 104 C52 124 36 128 22 121', rotate: -7, width: 11 },
    { d: 'M108 104 C128 124 144 128 158 121', rotate: 7, width: 11 },
  ];

  return (
    <motion.svg
      viewBox="0 0 180 170"
      className={className}
      animate={floatAnimation(animated, reduceMotion)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="octaviaBody" cx="35%" cy="24%" r="78%">
          <stop offset="0%" stopColor="#fde2f3" />
          <stop offset="46%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#c026d3" />
        </radialGradient>
        <linearGradient id="octaviaTentacle" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="55%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a21caf" />
        </linearGradient>
      </defs>

      <ellipse cx="90" cy="155" rx="55" ry="8" fill="#581c87" opacity="0.16" />

      {tentacles.map((tentacle, index) => (
        <motion.g
          key={tentacle.d}
          style={{ transformOrigin: '90px 100px' }}
          animate={wiggleAnimation(animated, reduceMotion, index * 0.08, tentacle.rotate)}
        >
          <path d={tentacle.d} fill="none" stroke="url(#octaviaTentacle)" strokeLinecap="round" strokeWidth={tentacle.width} />
          <path
            d={tentacle.d}
            fill="none"
            stroke="#fce7f3"
            strokeDasharray="1 15"
            strokeLinecap="round"
            strokeWidth="4"
            opacity="0.9"
          />
        </motion.g>
      ))}

      <path
        d="M43 70 C43 34 62 17 90 17 C118 17 137 34 137 70 C137 101 118 119 90 119 C62 119 43 101 43 70Z"
        fill="url(#octaviaBody)"
        stroke="#fce7f3"
        strokeWidth="6"
      />
      <path d="M62 39 C73 25 95 23 113 36" fill="none" stroke="#fff7fb" strokeLinecap="round" strokeWidth="7" opacity="0.6" />

      <ellipse cx="72" cy="68" rx="13" ry="15" fill="white" />
      <ellipse cx="108" cy="68" rx="13" ry="15" fill="white" />
      <circle cx="74" cy="71" r="6" fill="#111827" />
      <circle cx="106" cy="71" r="6" fill="#111827" />
      <circle cx="76" cy="68" r="2" fill="white" />
      <circle cx="108" cy="68" r="2" fill="white" />
      <ellipse cx="59" cy="84" rx="9" ry="5" fill="#fb7185" opacity="0.72" />
      <ellipse cx="121" cy="84" rx="9" ry="5" fill="#fb7185" opacity="0.72" />
      <path d="M78 90 C84 98 96 98 102 90" fill="none" stroke="#4c1d95" strokeLinecap="round" strokeWidth="4" />
    </motion.svg>
  );
}

function LilianaArt({ className, animated = false, reduceMotion = false }: AssistantAvatarArtProps) {
  const tendrils = [
    { d: 'M64 91 C46 86 31 72 27 53 C25 43 31 37 42 39', rotate: -6 },
    { d: 'M116 91 C134 86 149 72 153 53 C155 43 149 37 138 39', rotate: 6 },
    { d: 'M75 106 C59 116 52 133 52 151', rotate: -4 },
    { d: 'M105 106 C121 116 128 133 128 151', rotate: 4 },
  ];

  return (
    <motion.svg
      viewBox="0 0 180 170"
      className={className}
      animate={floatAnimation(animated, reduceMotion)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="lileFace" cx="36%" cy="24%" r="77%">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="47%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
        <linearGradient id="lileVine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#bef264" />
          <stop offset="52%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="lileLeaf" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="58%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="lileStem" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <ellipse cx="90" cy="157" rx="50" ry="8" fill="#064e3b" opacity="0.14" />

      {tendrils.map((tendril, index) => (
        <motion.g
          key={tendril.d}
          style={{ transformOrigin: '90px 95px' }}
          animate={wiggleAnimation(animated, reduceMotion, index * 0.1, tendril.rotate)}
        >
          <path d={tendril.d} fill="none" stroke="url(#lileVine)" strokeLinecap="round" strokeWidth="11" />
          <path
            d={tendril.d}
            fill="none"
            stroke="#dcfce7"
            strokeDasharray="1 14"
            strokeLinecap="round"
            strokeWidth="4"
            opacity="0.82"
          />
        </motion.g>
      ))}

      <path d="M75 107 C73 128 80 148 90 158 C100 148 107 128 105 107 C97 112 83 112 75 107Z" fill="url(#lileStem)" stroke="#dcfce7" strokeWidth="5" />
      <path d="M90 112 C85 93 87 75 91 56" fill="none" stroke="#166534" strokeLinecap="round" strokeWidth="9" />
      <path d="M90 112 C85 93 87 75 91 56" fill="none" stroke="#bbf7d0" strokeLinecap="round" strokeWidth="3.5" opacity="0.9" />

      <path d="M51 74 C37 68 31 55 37 43 C54 45 63 56 66 72Z" fill="url(#lileLeaf)" stroke="#dcfce7" strokeWidth="4" />
      <path d="M129 74 C143 68 149 55 143 43 C126 45 117 56 114 72Z" fill="url(#lileLeaf)" stroke="#dcfce7" strokeWidth="4" />
      <path d="M52 67 C52 36 68 19 90 19 C112 19 128 36 128 67 C128 99 111 118 90 118 C69 118 52 99 52 67Z" fill="url(#lileFace)" stroke="#dcfce7" strokeWidth="6" />

      <path d="M82 28 C69 14 50 10 42 22 C58 24 72 32 81 45Z" fill="#86efac" stroke="#dcfce7" strokeWidth="4" />
      <path d="M91 23 C87 8 95 1 108 7 C108 20 101 33 91 42Z" fill="#4ade80" stroke="#dcfce7" strokeWidth="4" />
      <path d="M101 30 C116 15 135 13 141 26 C125 29 112 37 102 48Z" fill="#86efac" stroke="#dcfce7" strokeWidth="4" />
      <path d="M73 39 C66 31 57 28 49 31 C56 42 65 48 76 49Z" fill="#22c55e" stroke="#dcfce7" strokeWidth="4" />
      <path d="M108 40 C116 31 127 29 134 35 C125 45 116 50 106 49Z" fill="#22c55e" stroke="#dcfce7" strokeWidth="4" />

      <g>
        <circle cx="116" cy="29" r="5.5" fill="#f9a8d4" stroke="#fff1f2" strokeWidth="2" />
        <circle cx="127" cy="30" r="5.5" fill="#f9a8d4" stroke="#fff1f2" strokeWidth="2" />
        <circle cx="122" cy="39" r="5.5" fill="#f9a8d4" stroke="#fff1f2" strokeWidth="2" />
        <circle cx="121" cy="33" r="4.5" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
      </g>

      <ellipse cx="75" cy="68" rx="11" ry="13" fill="white" />
      <ellipse cx="105" cy="68" rx="11" ry="13" fill="white" />
      <circle cx="77" cy="71" r="5.5" fill="#0f172a" />
      <circle cx="103" cy="71" r="5.5" fill="#0f172a" />
      <circle cx="79" cy="68" r="2" fill="white" />
      <circle cx="105" cy="68" r="2" fill="white" />
      <ellipse cx="64" cy="84" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.62" />
      <ellipse cx="116" cy="84" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.62" />
      <path d="M78 92 C84 99 96 99 102 92" fill="none" stroke="#064e3b" strokeLinecap="round" strokeWidth="4" />
    </motion.svg>
  );
}

function BorysArt({ className, animated = false, reduceMotion = false }: AssistantAvatarArtProps) {
  return (
    <motion.svg
      viewBox="0 0 180 170"
      className={className}
      animate={floatAnimation(animated, reduceMotion)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="borysCap" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="55%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="borysStem" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      <ellipse cx="90" cy="156" rx="48" ry="8" fill="#78350f" opacity="0.14" />

      <path d="M61 67 C62 39 75 25 91 25 C108 25 120 40 121 67 C122 99 111 119 91 119 C72 119 60 99 61 67Z" fill="url(#borysStem)" stroke="#ffedd5" strokeWidth="6" />
      <path d="M31 66 C39 33 62 15 91 15 C120 15 143 33 151 66 C132 76 112 80 91 80 C70 80 49 76 31 66Z" fill="url(#borysCap)" stroke="#fee2e2" strokeWidth="6" />
      <circle cx="64" cy="45" r="8" fill="#fee2e2" opacity="0.9" />
      <circle cx="94" cy="32" r="7" fill="#fee2e2" opacity="0.9" />
      <circle cx="121" cy="51" r="8" fill="#fee2e2" opacity="0.9" />
      <circle cx="78" cy="66" r="5" fill="#fee2e2" opacity="0.9" />

      <ellipse cx="78" cy="87" rx="10" ry="12" fill="white" />
      <ellipse cx="104" cy="87" rx="10" ry="12" fill="white" />
      <circle cx="80" cy="90" r="5" fill="#111827" />
      <circle cx="102" cy="90" r="5" fill="#111827" />
      <circle cx="82" cy="87" r="2" fill="white" />
      <circle cx="104" cy="87" r="2" fill="white" />
      <path d="M80 103 C86 109 96 109 102 103" fill="none" stroke="#78350f" strokeLinecap="round" strokeWidth="4" />
    </motion.svg>
  );
}

export default function AssistantAvatarArt(props: AssistantAvatarArtProps) {
  if (props.assistantId === 'liliana') return <LilianaArt {...props} />;
  if (props.assistantId === 'borys') return <BorysArt {...props} />;
  return <OctaviaArt {...props} />;
}
