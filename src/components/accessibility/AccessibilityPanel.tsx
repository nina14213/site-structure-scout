import { Accessibility, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAccessibility } from "./AccessibilityContext";

const COPY = {
  pl: {
    title: "Dostepnosc",
    open: "Otworz ustawienia dostepnosci WCAG",
    intro: "Ustawienia WCAG 2.2 AA",
    contrast: "Kontrast",
    contrastHint: "Dopasuj kontrast tekstu, obramowan i kontrolek.",
    contrastNormal: "Normalny",
    contrastEnhanced: "Podbity",
    contrastMaximum: "Maksymalny",
    textScale: "Powiekszenie tekstu",
    decreaseText: "Zmniejsz tekst",
    increaseText: "Powieksz tekst",
    textScaleHint: "Skala od 100 do 150 procent zgodna z powiekszeniem WCAG.",
    reduceMotion: "Spowolnij animacje",
    reduceMotionHint: "Spowalnia animacje CSS, przejscia, plynne przewijanie i ruch asystenta.",
    reset: "Reset",
  },
  en: {
    title: "Accessibility",
    open: "Open WCAG accessibility settings",
    intro: "WCAG 2.2 AA settings",
    contrast: "Contrast",
    contrastHint: "Adjust text, border and control contrast.",
    contrastNormal: "Normal",
    contrastEnhanced: "Enhanced",
    contrastMaximum: "Maximum",
    textScale: "Text size",
    decreaseText: "Decrease text",
    increaseText: "Increase text",
    textScaleHint: "Scale from 100 to 150 percent for WCAG zoom support.",
    reduceMotion: "Slow down animations",
    reduceMotionHint: "Slows CSS animations, transitions, smooth scrolling and assistant movement.",
    reset: "Reset",
  },
  fr: {
    title: "Accessibilite",
    open: "Ouvrir les reglages d'accessibilite WCAG",
    intro: "Reglages WCAG 2.2 AA",
    contrast: "Contraste",
    contrastHint: "Ajuste le contraste du texte, des bordures et des controles.",
    contrastNormal: "Normal",
    contrastEnhanced: "Renforce",
    contrastMaximum: "Maximum",
    textScale: "Taille du texte",
    decreaseText: "Reduire le texte",
    increaseText: "Agrandir le texte",
    textScaleHint: "Echelle de 100 a 150 pour le zoom WCAG.",
    reduceMotion: "Desactiver les animations",
    reduceMotionHint:
      "Arrete les animations CSS, les transitions, le defilement fluide et le mouvement de l'assistant.",
    reset: "Reset",
  },
  de: {
    title: "Barrierefreiheit",
    open: "WCAG-Barrierefreiheitsoptionen offnen",
    intro: "WCAG 2.2 AA Einstellungen",
    contrast: "Kontrast",
    contrastHint: "Passt den Kontrast von Text, Rahmen und Steuerelementen an.",
    contrastNormal: "Normal",
    contrastEnhanced: "Erhoht",
    contrastMaximum: "Maximal",
    textScale: "Textgrosse",
    decreaseText: "Text verkleinern",
    increaseText: "Text vergrossern",
    textScaleHint: "Skala von 100 bis 150 Prozent fur WCAG-Zoom.",
    reduceMotion: "Animationen ausschalten",
    reduceMotionHint: "Stoppt CSS-Animationen, Ubergange, sanftes Scrollen und die Bewegung des Assistenten.",
    reset: "Reset",
  },
};

type SettingRowProps = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function SettingRow({ id, label, description, checked, onCheckedChange }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-muted/30 p-3">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </Label>
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby={`${id}-hint`}
        className="mt-0.5"
      />
    </div>
  );
}

export default function AccessibilityPanel() {
  const { language } = useLanguage();
  const labels = COPY[language] ?? COPY.pl;
  const { settings, setSetting, resetSettings } = useAccessibility();
  const contrastOptions = [
    { value: "normal" as const, label: labels.contrastNormal },
    { value: "enhanced" as const, label: labels.contrastEnhanced },
    { value: "maximum" as const, label: labels.contrastMaximum },
  ];

  const updateTextScale = (value: number) => {
    setSetting("textScale", Math.min(150, Math.max(100, value)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-demo-id="wcag-trigger"
          variant="outline"
          size="sm"
          aria-label={labels.open}
          className="fixed top-4 right-4 gap-1.5 border-2 border-yellow-500 bg-yellow-300 px-3 font-bold text-slate-950 shadow-sm shadow-black/30 hover:border-yellow-400 hover:bg-yellow-200 hover:text-slate-950 focus-visible:ring-yellow-200 dark:border-yellow-300 dark:bg-yellow-300 dark:text-slate-950 dark:hover:bg-yellow-200"
        >
          <Accessibility className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-bold uppercase">WCAG</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-demo-id="wcag-panel"
        align="end"
        side="top"
        role="dialog"
        aria-label={labels.intro}
        className="w-[min(calc(100vw-2rem),22rem)] space-y-4"
      >
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">{labels.title}</h2>
          <p className="text-xs text-muted-foreground">{labels.intro}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <div className="space-y-1">
              <Label id="a11y-text-scale-label" className="text-sm font-semibold text-foreground">
                {labels.textScale}: {settings.textScale}%
              </Label>
              <p id="a11y-text-scale-hint" className="text-xs leading-relaxed text-muted-foreground">
                {labels.textScaleHint}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateTextScale(settings.textScale - 10)}
                disabled={settings.textScale <= 100}
                aria-label={labels.decreaseText}
                className="h-9 w-9"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </Button>
              <input
                type="range"
                min={100}
                max={150}
                step={10}
                value={settings.textScale}
                onChange={(event) => updateTextScale(Number(event.target.value))}
                aria-labelledby="a11y-text-scale-label"
                aria-describedby="a11y-text-scale-hint"
                className="h-2 min-w-0 flex-1 accent-primary"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateTextScale(settings.textScale + 10)}
                disabled={settings.textScale >= 150}
                aria-label={labels.increaseText}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <div className="space-y-1">
              <Label id="a11y-contrast-label" className="text-sm font-semibold text-foreground">
                {labels.contrast}
              </Label>
              <p id="a11y-contrast-hint" className="text-xs leading-relaxed text-muted-foreground">
                {labels.contrastHint}
              </p>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="a11y-contrast-label"
              aria-describedby="a11y-contrast-hint"
              className="grid grid-cols-3 gap-2"
            >
              {contrastOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.contrast === option.value ? "default" : "outline"}
                  size="sm"
                  role="radio"
                  aria-checked={settings.contrast === option.value}
                  onClick={() => setSetting("contrast", option.value)}
                  className="px-2 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <SettingRow
            id="a11y-reduce-motion"
            label={labels.reduceMotion}
            description={labels.reduceMotionHint}
            checked={settings.reduceMotion}
            onCheckedChange={(checked) => setSetting("reduceMotion", checked)}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={resetSettings} className="w-full justify-center gap-2">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {labels.reset}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
