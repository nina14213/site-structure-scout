

# Nowy Poziom: Species Matcher (Poziom 5)

## Koncepcja

Nowy poziom inspirowany narzedziem GBIF **Species Lookup** (https://www.gbif.org/tools/species-lookup). Gracz otrzymuje liste nazw gatunkow (czesciowo blednych, niepelnych lub z literowkami) i musi je dopasowac do oficjalnego taksonomicznego "backbone" GBIF.

## Mechanika gry

Gracz widzi tabele z kolumnami:
- **Nazwa wejsciowa** (np. "Ailantus altisima", "Quercus robur", "puma concolour") -- z celowymi bledami
- **Status dopasowania** -- gracz wybiera poprawna nazwe z podpowiedzi
- **Rank** (Kingdom/Phylum/Class/Order/Family/Genus/Species)
- **Confidence** -- wizualny wskaznik pewnosci dopasowania

Gracz musi:
1. Zidentyfikowac literowki w nazwach naukowych
2. Wybrac poprawna nazwe z listy sugestii (multiple choice)
3. Przypisac poprawne krolestwo (Kingdom) dla kazdego gatunku
4. Rozpoznac synonimy (np. stara nazwa vs akceptowana)

Punktacja:
- +20 pkt za poprawne dopasowanie nazwy
- +10 pkt za poprawne krolestwo
- +30 pkt bonus za rozpoznanie synonimu
- -5 pkt za bledna odpowiedz

## Wizualizacja

- Motyw: "Taxonomic Laboratory" -- ciemne tlo z zielonymi/niebieskimi neonami
- Animacja "skanowania" nazwy (pasek ladowania symulujacy odpytywanie API GBIF)
- Ikona: `Search` lub `Bug` z lucide-react
- Efekt "match found" z zielonym pulsem przy poprawnym dopasowaniu
- Efekt "no match" z czerwonym miganiem przy bledzie

## Przeplyw gry

```text
+---------------------------+
| Species Matcher           |
| Poziom 5                  |
+---------------------------+
        |
        v
+---------------------------+
| Tutorial: Co to backbone  |
| GBIF i species matching?  |
+---------------------------+
        |
        v
+---------------------------+
| Runda 1: Literowki        |
| 4 nazwy z bledami         |
| Wybierz poprawna nazwe    |
+---------------------------+
        |
        v
+---------------------------+
| Runda 2: Synonimy         |
| 3 przestarzale nazwy      |
| Znajdz akceptowana nazwe  |
+---------------------------+
        |
        v
+---------------------------+
| Runda 3: Kingdom Match    |
| 5 gatunkow - przypisz     |
| poprawne krolestwo        |
+---------------------------+
        |
        v
+---------------------------+
| Podsumowanie + Wynik      |
+---------------------------+
```

## Dane przykladowe

Przygotowane lokalnie (bez API), bazujac na prawdziwych danych GBIF:

| Nazwa wejsciowa | Poprawna nazwa | Kingdom | Typ bledu |
|---|---|---|---|
| Ailantus altisima | Ailanthus altissima | Plantae | Literowka |
| Puma concolour | Puma concolor | Animalia | Literowka |
| Ursus arctos arctos | Ursus arctos | Animalia | Podgatunek -> gatunek |
| Glis glis | Glis glis | Animalia | Poprawna (pulapka!) |
| Agaricus campester | Agaricus campestris | Fungi | Literowka |
| Hirundo urbica | Delichon urbicum | Animalia | Synonim |
| Quercus pedunculata | Quercus robur | Plantae | Synonim |
| Boletus edulis | Boletus edulis | Fungi | Poprawna (pulapka!) |

## Zmiany techniczne

### Nowe pliki
- `src/components/game/SpeciesMatcher.tsx` -- glowny komponent poziomu

### Modyfikowane pliki
- `src/components/game/index.ts` -- eksport nowego komponentu
- `src/components/game/GameLauncher.tsx` -- dodanie poziomu 5 do mapy
- `src/components/game/quizData.ts` -- 3 nowe pytania quizowe dla poziomu 5
- `src/pages/Index.tsx` -- aktualizacja `levelNames` (dodanie poziomu 5) i warunku zakonczenia gry (`quizLevel >= 5`)
- `src/components/game/StartScreen.tsx` -- dodanie kafelka poziomu 5 (jesli wyswietla liste poziomow)
- `src/components/game/LevelSelection.tsx` -- dodanie poziomu 5
- `src/components/StagesSection.tsx` -- dodanie Stage 5 z ikona `Search`

### Pytania quizowe (poziom 5)

1. "Co to jest GBIF Backbone Taxonomy?" -- Hierarchiczna klasyfikacja laczaca wszystkie nazwy gatunkow w GBIF
2. "Co to jest synonim taksonomiczny?" -- Nazwa naukowa uznana za rownoznaczna z inna, akceptowana nazwa
3. "Jaki rank taksonomiczny jest najnizszy?" -- Species (gatunek)

## Status bugu z podwojnym quizem

Na podstawie analizy kodu: fix z `transitioning.current` ref guard w `Index.tsx` oraz usuniecie wewnetrznych `QuizModal` z komponentow poziomow powinien rozwiazac problem. Jesli quiz nadal sie podwaja, potencjalna przyczyna to `React.StrictMode` w `src/main.tsx` wywolujace podwojny renderign w trybie dev -- ale nie powinno to powodowac podwojnego wyswietlania, bo ref guard to blokuje.

