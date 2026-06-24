import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Target, Award } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import TutorialAnimation from './tutorial/TutorialAnimation';

interface TutorialModalProps {
    levelNumber: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function TutorialModal({ levelNumber, isOpen, onClose }: TutorialModalProps) {
    const { t, language } = useLanguage();
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    // Escape do zamknięcia modala (WCAG 2.1.2). Bez auto-focus aby nie kraść fokusu z pól wewnątrz.
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCloseRef.current?.();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    const l = language;
    const pick = <T,>(pl: T, en: T, fr: T, de?: T): T => l === 'pl' ? pl : l === 'fr' ? fr : l === 'de' && de !== undefined ? de : en;

    const tutorials: Record<number, {
        emoji: string;
        titleKey: string;
        objectiveKey: string;
        steps: string[];
        tips: string[];
        scoring: string;
        animation?: React.ReactNode;
        animationTitle?: string;
        animationDescription?: string;
        animationHint?: string;
    }> = {
        1: {
            emoji: "⚡",
            titleKey: 'tutorial.1.title',
            objectiveKey: 'tutorial.1.objective',
            steps: pick(
                ["1. Wgraj swój CSV lub użyj przykładowych danych","2. Przeciągnij kolumny z lewej na odpowiednie nazwy terminów Darwin Core po prawej","3. Zacznij od wymaganych pól (czerwone obramowanie)","4. Sprawdź podpowiedzi - najedź na nazwę terminu, aby zobaczyć opis","5. Zmapuj wszystkie wymagane pola aby przejść dalej"],
                ["1. Upload your CSV or use sample data","2. Drag columns from the left to the matching terms on the right","3. Start with required fields (red border)","4. Check hints - hover over a term to see its description","5. Map all required fields to proceed"],
                ["1. Chargez votre CSV ou utilisez les données exemple","2. Glissez les colonnes de gauche vers les termes correspondants à droite","3. Commencez par les champs requis (bordure rouge)","4. Consultez les indices — survolez un terme pour voir sa description","5. Mappez tous les champs requis pour continuer"],
                ["1. Laden Sie Ihre CSV-Datei hoch oder verwenden Sie Beispieldaten","2. Ziehen Sie Spalten von links auf die passenden Begriffe rechts","3. Beginnen Sie mit den Pflichtfeldern (roter Rahmen)","4. Prüfen Sie Hinweise – fahren Sie über einen Begriff für die Beschreibung","5. Ordnen Sie alle Pflichtfelder zu, um fortzufahren"]
            ),
            tips: pick(
                ["💡 Wymagane pola: eventID, decimalLatitude, decimalLongitude, geodeticDatum, countryCode, eventDate, basisOfRecord, scientificName","🎯 Każda kolumna może być zmapowana tylko raz","⏱️ Im szybciej - tym więcej punktów!"],
                ["💡 Required fields: eventID, decimalLatitude, decimalLongitude, geodeticDatum, countryCode, eventDate, basisOfRecord, scientificName","🎯 Each column can only be mapped once","⏱️ The faster you go - the more points!"],
                ["💡 Champs requis : eventID, decimalLatitude, decimalLongitude, geodeticDatum, countryCode, eventDate, basisOfRecord, scientificName","🎯 Chaque colonne ne peut être mappée qu'une seule fois","⏱️ Plus vous êtes rapide, plus vous gagnez de points !"],
                ["💡 Pflichtfelder: eventID, decimalLatitude, decimalLongitude, geodeticDatum, countryCode, eventDate, basisOfRecord, scientificName","🎯 Jede Spalte kann nur einmal zugeordnet werden","⏱️ Je schneller, desto mehr Punkte!"]
            ),
            scoring: pick("+50 pkt za każde poprawne mapowanie, +100 bonus za 100% poprawność", "+50 pts per correct mapping, +100 bonus for 100% accuracy", "+50 pts par mappage correct, +100 bonus pour 100% d'exactitude", "+50 Pkt. pro korrekter Zuordnung, +100 Bonus für 100% Richtigkeit"),
            animation: <TutorialAnimation type="drag-drop" />,
            animationTitle: pick('Jak przeciągać kolumny', 'How to drag columns', 'Comment glisser les colonnes', 'So ziehst du Spalten'),
            animationDescription: pick(
                'Złap kolumnę po lewej, przeciągnij ją na pasującą nazwę terminu Darwin Core po prawej i puść, aby utworzyć mapowanie.',
                'Grab a column on the left, drag it onto the matching Darwin Core term on the right, and release to create the mapping.',
                'Saisissez une colonne à gauche, faites-la glisser vers le terme Darwin Core correspondant à droite, puis relâchez pour créer le mappage.',
                'Greife links eine Spalte, ziehe sie auf den passenden Darwin Core-Begriff rechts und lasse los, um die Zuordnung zu erstellen.'
            ),
            animationHint: pick(
                'Na telefonie dotknij kolumnę i potem pole docelowe.',
                'On mobile, tap the column first and then the target field.',
                'Sur mobile, touchez d’abord la colonne puis le champ cible.',
                'Auf dem Smartphone tippe zuerst die Spalte und dann das Zielfeld an.'
            )
        },
        2: {
            emoji: "🔗",
            titleKey: 'tutorial.2.title',
            objectiveKey: 'tutorial.2.objective',
            steps: pick(
                ["1. Zobacz jakie ID są w core (event.txt)","2. Kliknij 'Sprawdź Referential Integrity' dla taxon.txt","3. Kliknij 'Sprawdź Referential Integrity' dla multimedia.txt","4. Jeśli są błędy - usuń nieprawidłowe rekordy przyciskiem 'Usuń'","5. Upewnij się że wszystkie extensions są połączone bez błędów"],
                ["1. Check which IDs are in the core (event.txt)","2. Click 'Check Referential Integrity' for taxon.txt","3. Click 'Check Referential Integrity' for multimedia.txt","4. If there are errors - remove invalid records with the 'Remove' button","5. Make sure all extensions are linked without errors"],
                ["1. Vérifiez quels ID sont dans le core (event.txt)","2. Cliquez sur 'Vérifier l'intégrité référentielle' pour taxon.txt","3. Cliquez sur 'Vérifier l'intégrité référentielle' pour multimedia.txt","4. En cas d'erreurs — supprimez les enregistrements invalides avec le bouton 'Supprimer'","5. Assurez-vous que toutes les extensions sont liées sans erreur"],
                ["1. Prüfen Sie, welche IDs im Core (event.txt) vorhanden sind","2. Klicken Sie auf 'Referentielle Integrität prüfen' für taxon.txt","3. Klicken Sie auf 'Referentielle Integrität prüfen' für multimedia.txt","4. Bei Fehlern — entfernen Sie ungültige Datensätze mit der Schaltfläche 'Entfernen'","5. Stellen Sie sicher, dass alle Extensions fehlerfrei verknüpft sind"]
            ),
            tips: pick(
                ["💡 Taxon extension automatycznie przechodzi (brak foreign key do core)","🎯 Multimedia musi mieć eventID istniejące w core","⚠️ Nieprawidłowe ID można usunąć jednym kliknięciem"],
                ["💡 Taxon extension passes automatically (no foreign key to core)","🎯 Multimedia must have an eventID that exists in core","⚠️ Invalid IDs can be removed with one click"],
                ["💡 L'extension Taxon passe automatiquement (pas de clé étrangère vers le core)","🎯 Multimedia doit avoir un eventID existant dans le core","⚠️ Les ID invalides peuvent être supprimés en un clic"],
                ["💡 Die Taxon-Extension wird automatisch bestanden (kein Fremdschlüssel zum Core)","🎯 Multimedia muss eine eventID haben, die im Core existiert","⚠️ Ungültige IDs können mit einem Klick entfernt werden"]
            ),
            scoring: pick("+100 pkt za każdy połączony extension, +25 pkt za sprawdzenie integrity", "+100 pts per linked extension, +25 pts for checking integrity", "+100 pts par extension liée, +25 pts pour la vérification d'intégrité", "+100 Pkt. pro verknüpfter Extension, +25 Pkt. für Integritätsprüfung")
        },
        3: {
            emoji: "📦",
            titleKey: 'tutorial.3.title',
            objectiveKey: 'tutorial.3.objective',
            steps: pick(
                ["1. Wypełnij metadane datasetu (tytuł, opis, autor, licencja)","2. Kliknij 'Generuj meta.xml' - plik opisujący strukturę","3. Kliknij 'Generuj datapackage.json' - metadane Frictionless","4. Możesz podejrzeć wygenerowane pliki w zakładkach","5. Pobierz meta.xml jeśli chcesz zobaczyć plik lokalnie"],
                ["1. Fill in dataset metadata (title, description, author, license)","2. Click 'Generate meta.xml' - the file describing the structure","3. Click 'Generate datapackage.json' - Frictionless metadata","4. You can preview generated files in the tabs","5. Download meta.xml if you want to see the file locally"],
                ["1. Remplissez les métadonnées du jeu de données (titre, description, auteur, licence)","2. Cliquez sur 'Générer meta.xml' — le fichier décrivant la structure","3. Cliquez sur 'Générer datapackage.json' — métadonnées Frictionless","4. Vous pouvez prévisualiser les fichiers générés dans les onglets","5. Téléchargez meta.xml pour voir le fichier localement"],
                ["1. Füllen Sie die Datensatz-Metadaten aus (Titel, Beschreibung, Autor, Lizenz)","2. Klicken Sie auf 'meta.xml generieren' — die Datei beschreibt die Struktur","3. Klicken Sie auf 'datapackage.json generieren' — Frictionless-Metadaten","4. Sie können die erzeugten Dateien in den Tabs ansehen","5. Laden Sie meta.xml herunter, um die Datei lokal zu sehen"]
            ),
            tips: pick(
                ["💡 meta.xml jest wymagany przez GBIF do publikacji danych","🎯 datapackage.json to standard Frictionless Data","📄 Oba pliki automatycznie zawierają strukturę z poprzednich poziomów"],
                ["💡 meta.xml is required by GBIF for data publication","🎯 datapackage.json is the Frictionless Data standard","📄 Both files automatically include the structure from previous levels"],
                ["💡 meta.xml est requis par GBIF pour la publication des données","🎯 datapackage.json est le standard Frictionless Data","📄 Les deux fichiers incluent automatiquement la structure des niveaux précédents"],
                ["💡 meta.xml wird von GBIF für die Datenpublikation benötigt","🎯 datapackage.json ist der Frictionless Data-Standard","📄 Beide Dateien enthalten automatisch die Struktur der vorherigen Stufen"]
            ),
            scoring: pick("+150 pkt za meta.xml, +150 pkt za datapackage.json, +bonus za czas", "+150 pts for meta.xml, +150 pts for datapackage.json, +time bonus", "+150 pts pour meta.xml, +150 pts pour datapackage.json, +bonus de temps", "+150 Pkt. für meta.xml, +150 Pkt. für datapackage.json, +Zeitbonus")
        },
        4: {
            emoji: "🧬",
            titleKey: 'tutorial.4.title',
            objectiveKey: 'tutorial.4.objective',
            steps: pick(
                ["1. Runda 1: Popraw literówki w nazwach naukowych","2. Runda 2: Rozpoznaj synonimy i znajdź akceptowane nazwy","3. Runda 3: Przypisz poprawne królestwo (Kingdom) do gatunków","4. Uważaj na pułapki — niektóre nazwy są poprawne!"],
                ["1. Round 1: Fix typos in scientific names","2. Round 2: Identify synonyms and find accepted names","3. Round 3: Assign the correct kingdom to species","4. Watch for traps — some names are correct!"],
                ["1. Manche 1 : Corrigez les fautes de frappe dans les noms scientifiques","2. Manche 2 : Identifiez les synonymes et trouvez les noms acceptés","3. Manche 3 : Attribuez le bon règne aux espèces","4. Attention aux pièges — certains noms sont corrects !"],
                ["1. Runde 1: Tippfehler in wissenschaftlichen Namen korrigieren","2. Runde 2: Synonyme erkennen und akzeptierte Namen finden","3. Runde 3: Das richtige Reich (Kingdom) den Arten zuordnen","4. Achtung bei Fallen — manche Namen sind korrekt!"]
            ),
            tips: pick(
                ["🧬 GBIF Backbone Taxonomy łączy ponad 2 mln nazw gatunków","🔍 Synonimy to stare nazwy uznane za równoznaczne z nowymi","⚠️ Nie każda nazwa zawiera błąd — niektóre są poprawne!"],
                ["🧬 GBIF Backbone Taxonomy links over 2M species names","🔍 Synonyms are old names considered equivalent to new ones","⚠️ Not every name contains an error — some are correct!"],
                ["🧬 GBIF Backbone Taxonomy relie plus de 2M de noms d'espèces","🔍 Les synonymes sont d'anciens noms considérés comme équivalents","⚠️ Chaque nom ne contient pas forcément d'erreur — certains sont corrects !"],
                ["🧬 GBIF Backbone Taxonomy verknüpft über 2 Mio. Artennamen","🔍 Synonyme sind alte Namen, die als gleichwertig mit neuen gelten","⚠️ Nicht jeder Name enthält einen Fehler — manche sind korrekt!"]
            ),
            scoring: pick("+20 pkt za literówkę, +30 pkt za synonim, +10 pkt za królestwo, -5 pkt za błąd", "+20 pts for typo, +30 pts for synonym, +10 pts for kingdom, -5 pts for error", "+20 pts par faute, +30 pts par synonyme, +10 pts par règne, -5 pts par erreur", "+20 Pkt. für Tippfehler, +30 Pkt. für Synonym, +10 Pkt. für Reich, -5 Pkt. für Fehler")
        },
        5: {
            emoji: "👹",
            titleKey: 'tutorial.5.title',
            objectiveKey: 'tutorial.5.objective',
            steps: pick(
                ["1. Kliknij 'Uruchom Walidację GBIF'","2. Obserwuj 6 kroków walidacji (UTF-8, wymagane pola, ID, formaty, współrzędne, integrity)","3. Każdy krok musi przejść (zielona ikona ✓)","4. Jeśli jest błąd - wróć do poprzednich poziomów i napraw dane","5. Po pomyślnej walidacji - ukończ misję!"],
                ["1. Click 'Run GBIF Validation'","2. Watch 6 validation steps (UTF-8, required fields, IDs, formats, coordinates, integrity)","3. Each step must pass (green ✓ icon)","4. If there's an error - go back to previous levels and fix the data","5. After successful validation - complete the mission!"],
                ["1. Cliquez sur 'Lancer la validation GBIF'","2. Observez les 6 étapes de validation (UTF-8, champs requis, ID, formats, coordonnées, intégrité)","3. Chaque étape doit passer (icône verte ✓)","4. En cas d'erreur — retournez aux niveaux précédents pour corriger les données","5. Après une validation réussie — terminez la mission !"],
                ["1. Klicken Sie auf 'GBIF-Validierung starten'","2. Beobachten Sie 6 Validierungsschritte (UTF-8, Pflichtfelder, IDs, Formate, Koordinaten, Integrität)","3. Jeder Schritt muss bestanden werden (grünes ✓-Symbol)","4. Bei Fehlern — gehen Sie zu vorherigen Stufen zurück und korrigieren Sie die Daten","5. Nach erfolgreicher Validierung — schließen Sie die Mission ab!"]
            ),
            tips: pick(
                ["💡 Walidacja symuluje prawdziwy GBIF Data Validator","🎯 Sprawdza: kodowanie UTF-8, wymagane pola, unikalność ID, formaty dat i współrzędnych","⚠️ Błędy krytyczne (czerwone ✗) blokują publikację"],
                ["💡 Validation simulates the real GBIF Data Validator","🎯 Checks: UTF-8 encoding, required fields, ID uniqueness, date and coordinate formats","⚠️ Critical errors (red ✗) block publication"],
                ["💡 La validation simule le vrai GBIF Data Validator","🎯 Vérifie : encodage UTF-8, champs requis, unicité des ID, formats de dates et coordonnées","⚠️ Les erreurs critiques (✗ rouge) bloquent la publication"],
                ["💡 Die Validierung simuliert den echten GBIF Data Validator","🎯 Prüft: UTF-8-Kodierung, Pflichtfelder, ID-Eindeutigkeit, Datums- und Koordinatenformate","⚠️ Kritische Fehler (rotes ✗) blockieren die Veröffentlichung"]
            ),
            scoring: pick("+50 pkt za każdy krok walidacji, +200 bonus za perfekcyjne przejście", "+50 pts per validation step, +200 bonus for perfect pass", "+50 pts par étape de validation, +200 bonus pour un passage parfait", "+50 Pkt. pro Validierungsschritt, +200 Bonus für perfektes Bestehen")
        }
    };

    if (!isOpen || !tutorials[levelNumber]) return null;

    const tutorial = tutorials[levelNumber];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                onClick={onClose}
                style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    ref={dialogRef}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`tutorial-title-${levelNumber}`}
                    className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] border border-gray-200 dark:border-slate-700 overflow-hidden relative z-[10000] mx-auto focus:outline-none flex flex-col"
                    style={{ zIndex: 10000 }}
                >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 p-4 sm:p-6 relative flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('tutorial.close') || 'Zamknij'} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20">
                            <X className="w-5 h-5" aria-hidden="true" />
                        </Button>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <span className="text-4xl sm:text-6xl" aria-hidden="true">{tutorial.emoji}</span>
                            <div className="flex flex-col items-center">
                                <Badge className="mb-2 bg-white/20 text-white">{t('tutorial.level')} {levelNumber}</Badge>
                                <h2 id={`tutorial-title-${levelNumber}`} className="text-2xl font-bold text-white">{t(tutorial.titleKey)}</h2>
                            </div>
                        </div>
                    </div>

                    <div
                        data-demo-id="tutorial-scroll-area"
                        className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto text-center flex-1 min-h-0 overscroll-contain"
                    >
                        <Card className="bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30">
                            <CardContent className="pt-4">
                                <div className="flex flex-col items-center gap-3">
                                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('tutorial.missionGoal')}</h3>
                                        <p className="text-gray-700 dark:text-slate-300">{t(tutorial.objectiveKey)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {tutorial.animation && (
                            <Card className="bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30">
                                <CardContent className="pt-4">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="text-center">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tutorial.animationTitle}</h3>
                                            <p className="text-sm text-gray-700 dark:text-slate-300 max-w-xl">{tutorial.animationDescription}</p>
                                        </div>
                                        <div className="w-full max-w-md">
                                            {tutorial.animation}
                                        </div>
                                        {tutorial.animationHint && (
                                            <p className="text-xs text-sky-700 dark:text-sky-200">{tutorial.animationHint}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                                {t('tutorial.steps')}
                            </h3>
                            <div className="space-y-2">
                                {tutorial.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-center justify-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200 dark:bg-slate-700/30 dark:border-slate-600/50">
                                        <span className="text-gray-700 dark:text-slate-300 text-center">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                                {t('tutorial.tips')}
                            </h3>
                            <div className="space-y-2">
                                {tutorial.tips.map((tip, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-200 text-sm text-center">
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Card className="bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30">
                            <CardContent className="pt-4">
                                <div className="flex flex-col items-center gap-3">
                                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('tutorial.scoring')}</h3>
                                        <p className="text-gray-700 dark:text-slate-300 text-sm">{tutorial.scoring}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex-shrink-0">
                        <Button
                            data-demo-id="tutorial-start"
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            size="lg"
                        >
                            {t('tutorial.start')}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
