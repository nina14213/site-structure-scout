## Plan wdrożenia dostępności cyfrowej (WCAG 2.1 AA)

Cel: doprowadzić DwC Data Quest do zgodności z WCAG 2.1 AA, ze szczególnym uwzględnieniem nawigacji klawiaturą, czytników ekranu, kontrastu i obsługi mobilnej. Pracujemy etapami, po jednym priorytecie na turę, żeby ograniczyć zużycie kredytów.

### Etap 1 — Fundamenty semantyczne (krytyczne)
1. **`<html lang>` dynamiczny** — `index.html` ma na sztywno `lang="en"`, choć domyślnym językiem jest PL i mamy 4 języki. Zmienić na `lang="pl"` jako default i aktualizować z poziomu `LanguageToggle`/i18n providera przy zmianie języka.
2. **Landmark `<main>`** — żaden komponent nie używa `<main>`. Dodać dokładnie jeden `<main id="main">` w `App.tsx` wokół `<Routes>` (lub w layoucie strony).
3. **Skip link** — dodać „Przejdź do treści" jako pierwszy element body, widoczny przy focusie, kierujący do `#main`.
4. **Hierarchia nagłówków** — przejrzeć `Hero`, `HeroSection`, `StagesSection`, `ResourcesSection`, `Footer`, ekrany misji: dokładnie jeden `<h1>` na stronę, brak przeskoków poziomów.

### Etap 2 — Klawiatura i fokus (krytyczne)
1. **Focus-visible** — dodać globalny styl `:focus-visible` w `index.css` z wyraźnym pierścieniem (ring) w kolorze akcentu, kontrast ≥ 3:1 do tła w obu motywach.
2. **Interaktywne `div`/`span` z `onClick`** — audyt komponentów gry (`SchemaMapper`, `SpeciesMatcher`, `Validator`, `EscapeRoom`, `CoreBuilder`, `ExtensionLinker`, `MetaGenerator`, `LevelSelection`). Zamienić na `<button>` lub dodać `role="button"`, `tabIndex={0}` i obsługę `Enter`/`Space`.
3. **Drag & drop Schema Mapper** — zapewnić alternatywę klawiaturową (tap-to-assign już jest na mobile — rozszerzyć na desktop z `Enter`/strzałkami) oraz komunikaty `aria-live` o przypisaniach.
4. **Pułapki fokusu w modalach** — sprawdzić `TutorialModal` i quizy: użyć shadcn `Dialog` (Radix) zamiast własnych overlayów tam, gdzie się da.

### Etap 3 — Czytniki ekranu (warning)
1. **Etykiety przycisków ikon** — pliki używające `size="icon"`: `StartScreen`, `TutorialModal`, `Nav`, `LanguageToggle`. Każdy `Button` ikonowy dostaje `aria-label` przetłumaczony przez i18n.
2. **`alt` dla obrazów** — `MascotIcon`, ilustracje misji, logo AMUNATCOLL. Dekoracyjne → `alt=""` + `aria-hidden`, treściowe → opisowy `alt` z tłumaczeniem.
3. **Formularze** — wszystkie inputy w `DataImport`, `MetaGenerator`, `MissingValuesPanel`, quizach: jawny `<label htmlFor>` lub `aria-label`; komunikaty walidacji powiązane przez `aria-describedby`; błędy ogłaszane w `aria-live="polite"`.
4. **Dynamiczne regiony** — wynik quizu, status misji, toasty: `role="status"` / `aria-live="polite"` (toast shadcn już to ma, zweryfikować).
5. **Język treści w innym języku** — fragmenty DwC po angielsku w PL UI: `<span lang="en">` na nazwach pól Darwin Core.

### Etap 4 — Wizualne i mobilne (warning)
1. **Kontrast** — zaudytować ciemny motyw cyberpunk i jasny motyw. Neon na czarnym często nie spełnia 4.5:1 dla tekstu — wymierzyć tokeny w `index.css` i podbić tam, gdzie trzeba (zachowując estetykę). Stany hover/disabled również ≥ 3:1.
2. **Kolor nie jest jedynym nośnikiem** — walidator i quiz: dodać ikonę ✓/✗ obok koloru zielony/czerwony.
3. **`h-screen` → `h-dvh`** — 15 plików (lista wyżej). Zamienić, żeby uniknąć obcięcia na mobilkach z dynamicznym paskiem URL.
4. **Tap-targety ≥ 44×44 px** — `size="icon"` shadcn ma 36 px. Tam gdzie to akcja główna na mobile: `min-h-11 min-w-11`.
5. **Redukcja ruchu** — uszanować `prefers-reduced-motion` w animacjach (Schema Mapper tutorial, mini-celebrations, animacje GSAP/Framer).

### Etap 5 — Polityka i dokumentacja
1. **Deklaracja dostępności** — strona `/deklaracja-dostepnosci` (wymagana w PL dla podmiotów publicznych, UAM jest publiczny) z szablonem zgodnym z Ustawą o dostępności cyfrowej z 4 kwietnia 2019.
2. **Mechanizm zgłaszania nieprawidłowości** — formularz/email kontaktowy w stopce + link do deklaracji.
3. **`@media (prefers-contrast: more)`** — opcjonalny tryb wysokiego kontrastu.

### Kolejność wdrożenia
Sugeruję podzielić na ~5 osobnych zleceń (po etapie). Etap 1 + 2 to najwyższy priorytet — bez nich aplikacja jest niedostępna dla użytkowników klawiatury i czytników. Etapy 3–5 podnoszą jakość, ale nie blokują dostępu.

### Szczegóły techniczne
- WCAG 2.1 AA + Ustawa o dostępności cyfrowej (PL, 2019) jako norma odniesienia.
- Narzędzia weryfikacji: Lighthouse a11y, axe DevTools, ręczny test NVDA/VoiceOver.
- Tokeny kontrastu trzymamy w `src/index.css` zgodnie z istniejącym design systemem (HSL).
- Przy zmianach `Button` korzystamy z istniejących wariantów shadcn, nie tworzymy własnych focusów.
- i18n: nowe stringi (skip link, aria-labele, deklaracja dostępności) dodawane do `src/i18n/translations.ts` we wszystkich 4 językach (PL, EN, FR, DE).

Daj znać, od którego etapu zaczynamy — domyślnie proponuję Etap 1.
