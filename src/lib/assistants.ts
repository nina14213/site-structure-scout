export type AssistantId = 'octavia' | 'liliana' | 'borys';

export interface AssistantProfile {
  id: AssistantId;
  name: string;
  species: string;
  description: string;
  accentLabel: string;
  nameKey: string;
  speciesKey: string;
  descriptionKey: string;
  badgeClass: string;
  buttonClass: string;
  hiddenButtonClass: string;
  selectionClass: string;
  selectedRingClass: string;
  frame: {
    main: string;
    highlight: string;
    border: string;
  };
}

export const DEFAULT_ASSISTANT_ID: AssistantId = 'octavia';

export const assistantProfiles: AssistantProfile[] = [
  {
    id: 'octavia',
    name: 'Ośmiornica Octavia',
    species: 'Ośmiornica',
    description: 'Energiczna, różowa asystentka. Najlepsza do szybkich podpowiedzi w trakcie gry.',
    accentLabel: 'Macki',
    nameKey: 'assistant.octavia.name',
    speciesKey: 'assistant.octavia.species',
    descriptionKey: 'assistant.octavia.description',
    badgeClass: 'border-pink-500/40 bg-pink-500/15 text-pink-700 dark:text-pink-300',
    buttonClass: 'bg-pink-700 text-white hover:bg-pink-800',
    hiddenButtonClass: 'border-pink-200 bg-pink-600 text-white focus-visible:ring-pink-300',
    selectionClass: 'hover:border-pink-400 hover:bg-pink-500/10',
    selectedRingClass: 'border-pink-500 bg-pink-500/15 ring-pink-300',
    frame: {
      main: '#db2777',
      highlight: '#fce7f3',
      border: 'border-pink-300/80',
    },
  },
  {
    id: 'liliana',
    name: 'Liana Lili',
    species: 'Roślina liana',
    description: 'Spokojna roślinna przewodniczka. Pomaga krok po kroku, bez pośpiechu.',
    accentLabel: 'Liany',
    nameKey: 'assistant.lile.name',
    speciesKey: 'assistant.lile.species',
    descriptionKey: 'assistant.lile.description',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    buttonClass: 'bg-emerald-700 text-white hover:bg-emerald-800',
    hiddenButtonClass: 'border-emerald-200 bg-emerald-600 text-white focus-visible:ring-emerald-300',
    selectionClass: 'hover:border-emerald-400 hover:bg-emerald-500/10',
    selectedRingClass: 'border-emerald-500 bg-emerald-500/15 ring-emerald-300',
    frame: {
      main: '#059669',
      highlight: '#bbf7d0',
      border: 'border-emerald-300/80',
    },
  },
  {
    id: 'borys',
    name: 'Borowik Borys',
    species: 'Grzyb',
    description: 'Ciepły, cierpliwy pomocnik. Dobrze tłumaczy, gdy trzeba chwilę pomyśleć.',
    accentLabel: 'Grzybnia',
    nameKey: 'assistant.borys.name',
    speciesKey: 'assistant.borys.species',
    descriptionKey: 'assistant.borys.description',
    badgeClass: 'border-amber-600/40 bg-amber-500/15 text-amber-800 dark:text-amber-300',
    buttonClass: 'bg-amber-700 text-white hover:bg-amber-800',
    hiddenButtonClass: 'border-amber-200 bg-amber-700 text-white focus-visible:ring-amber-300',
    selectionClass: 'hover:border-amber-400 hover:bg-amber-500/10',
    selectedRingClass: 'border-amber-500 bg-amber-500/15 ring-amber-300',
    frame: {
      main: '#b45309',
      highlight: '#fde68a',
      border: 'border-amber-300/80',
    },
  },
];

export const isAssistantId = (value: unknown): value is AssistantId =>
  value === 'octavia' || value === 'liliana' || value === 'borys';

export const getAssistantProfile = (id?: string | null): AssistantProfile =>
  assistantProfiles.find((assistant) => assistant.id === id) ?? assistantProfiles[0];
