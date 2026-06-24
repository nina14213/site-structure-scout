import { useState } from "react";
import { Accessibility, Type, Palette, Underline, Minus, Plus, RotateCcw, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/accessibility/AccessibilityContext";

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const {
    fontScale,
    grayscale,
    underlineInteractive,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleGrayscale,
    toggleUnderlineInteractive,
  } = useAccessibility();

  return (
    <div className="fixed right-4 bottom-4 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Accessibility className="h-4 w-4" />
            Ułatwienia dostępności
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Type className="h-4 w-4" />
                Rozmiar czcionki
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={decreaseFont} aria-label="Zmniejsz czcionkę">
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="min-w-[88px] text-center text-sm font-semibold">
                  {Math.round(fontScale * 100)}%
                </div>
                <Button type="button" variant="outline" size="icon" onClick={increaseFont} aria-label="Powiększ czcionkę">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={resetFont} className="ml-auto">
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Palette className="h-4 w-4" />
                Odcień szarości
              </div>
              <Button
                type="button"
                variant={grayscale ? "default" : "outline"}
                className="w-full justify-start"
                onClick={toggleGrayscale}
              >
                {grayscale ? "Wyłącz odcień szarości" : "Włącz odcień szarości"}
              </Button>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Underline className="h-4 w-4" />
                Podkreśl elementy interaktywne
              </div>
              <Button
                type="button"
                variant={underlineInteractive ? "default" : "outline"}
                className="w-full justify-start"
                onClick={toggleUnderlineInteractive}
              >
                {underlineInteractive ? "Wyłącz podkreślanie" : "Włącz podkreślanie"}
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1 font-medium text-foreground">
                <Keyboard className="h-3.5 w-3.5" />
                Skróty klawiaturowe
              </div>
              <div>`Ctrl` + `Shift` + `+` powiększ</div>
              <div>`Ctrl` + `Shift` + `-` zmniejsz</div>
              <div>`Ctrl` + `Shift` + `0` reset rozmiaru</div>
              <div>`Ctrl` + `Shift` + `G` odcień szarości</div>
              <div>`Ctrl` + `Shift` + `U` podkreślanie</div>
              <div className="mt-1">`Tab` włącza mocniejsze obramowania fokusów, `Ctrl` chwilowo podświetla elementy interaktywne.</div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="default"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Panel ułatwień dostępności"
        aria-expanded={open}
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    </div>
  );
}

