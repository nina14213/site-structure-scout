
# Plan: Idiotoodporny samouczek Schema Mapper

## 1. Redukcja kroków (11 → 7)

### Faza 1 (Mapowanie) — 4 kroki zamiast 5:
| # | Obecny | Nowy | Zmiana |
|---|--------|------|--------|
| 0 | Intro (ściana tekstu) | **Czym jest mapowanie?** — 2 zdania + animacja drag&drop | Uproszczenie |
| 1 | Twoje kolumny | **Twoje kolumny → pola DwC** — połączone z krokiem 2 | Scalenie 1+2 |
| 2 | Schematy DwC-DP | *(scalony z krokiem 1)* | — |
| 3 | Łączenie pipe | **⭐ Pro tip: Łączenie kolumn** — oznaczony jako zaawansowany, skrócony | Oznaczenie |
| 4 | Auto mapping | **Automatyczne mapowanie** — prostszy opis | Uproszczenie |

### Faza 2 (Przegląd) — 3 kroki zamiast 6:
| # | Obecny | Nowy | Zmiana |
|---|--------|------|--------|
| 5 | Przegląd konfiguracji | **Sprawdź wynik** — scalenie z pobieraniem | Uproszczenie |
| 6+7 | Ukrywanie + Extra cols | **⭐ Pro tip: Dostosuj tabele** — jeden krok zaawansowany | Scalenie |
| 8+9 | Pobieranie + ID Gen | **Pobierz gotowy pakiet** — ID gen jako podpunkt | Scalenie |
| 10 | Outro | *(usunięty — zbędny)* | Usunięcie |

## 2. Prostszy język — zasady
- Żadnego żargonu bez wyjaśnienia
- Max 3 zdania na krok + max 2 bullet points
- Ton: przyjazny, bezpośredni ("kliknij tu", "przeciągnij tam")
- Komunikaty uspokajające wplecione naturalnie ("możesz to cofnąć")

## 3. Mini-animacje CSS w tooltipach
- Krok "Mapowanie": animowana strzałka kolumna → pole (CSS keyframes, bez GIFów)
- Krok "Auto mapping": pulsujący przycisk
- Krok "Sprawdź wynik": animowany checkmark

## 4. Słowniczek pojęć (glossary tooltip)
- Komponent `<GlossaryTerm>` — hover/tap pokazuje definicję
- Terminy: **mapowanie**, **DwC** (Darwin Core), **schemat/tabela**, **pole**, **ID**
- Osadzony inline w opisach kroków

## 5. Pliki do zmiany
1. `src/components/game/SchemaMapperTutorial.tsx` — nowa struktura kroków, animacje
2. `src/components/game/tutorial/GlossaryTerm.tsx` — **nowy** komponent słowniczka
3. `src/components/game/tutorial/TutorialAnimation.tsx` — **nowy** komponent animacji
4. `src/i18n/translations.ts` — nowe, uproszczone teksty (PL + EN)
