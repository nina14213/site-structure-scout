/**
 * @file Index.tsx
 * @description Główna strona gry DwC Data Quest — orkiestruje ekrany gry.
 *
 * Logika jest wydzielona do hooków:
 * - useGameProgress — stan gry, postęp, odznaki, leaderboard
 * - useGameSounds — efekty dźwiękowe (Web Audio API)
 * - useGameNavigation — nawigacja, przejścia ekranów, dark mode
 */

import { useGameProgress, BADGES } from '@/hooks/useGameProgress';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameNavigation } from '@/hooks/useGameNavigation';
import { StartScreen, GameLauncher, GameComplete, WelcomeScreen } from '@/components/game';
import SchemaMapper from '@/components/game/SchemaMapper';
import QuizModal from '@/components/game/QuizModal';
import GuideAssistant from '@/components/game/GuideAssistant';
import { GuideSurfaceProvider } from '@/components/game/GuideSurfaceContext';

const IndexContent = () => {
  const progress = useGameProgress();
  const sounds = useGameSounds();
  const nav = useGameNavigation(progress);
  const assistant = (
    <GuideAssistant
      currentScreen={nav.currentScreen}
      currentLevel={nav.currentLevel}
      gameState={progress.gameState}
    />
  );

  // ─── Screen rendering ─────────────────────────────────────────────

  if (nav.currentScreen === 'complete') {
    return (
      <>
        <GameComplete
          gameState={progress.gameState}
          badges={BADGES}
          onRestart={nav.handleRestart}
          onBackToMenu={nav.handleBackToMenu}
          playBadgeUnlock={sounds.playBadgeUnlock}
        />
        {assistant}
      </>
    );
  }

  if (nav.currentScreen === 'schemaMapper') {
    const importData = nav.levelData.customImport;
    return (
      <>
        <SchemaMapper
          columns={importData?.columns}
          data={importData?.data}
          fileName={importData?.fileName}
          onBack={nav.handleBackToMenu}
          onComplete={nav.handleSchemaMappingComplete}
        />
        {assistant}
      </>
    );
  }

  if (nav.currentScreen === 'quiz' && nav.quizLevel !== null) {
    return (
      <>
        <QuizModal
          levelNumber={nav.quizLevel}
          onComplete={nav.handleQuizComplete}
          onClose={nav.handleQuizClose}
        />
        {assistant}
      </>
    );
  }

  if (nav.currentScreen === 'playing' && nav.currentLevel !== null) {
    return (
      <>
        <GameLauncher
          levelId={nav.currentLevel}
          gameState={progress.gameState}
          onComplete={nav.handleLevelComplete}
          onClose={nav.handleBackToMenu}
          addScore={progress.addScore}
          playSuccess={sounds.playSuccess}
          playFail={sounds.playFail}
          playDrop={sounds.playDrop}
          playLevelComplete={sounds.playLevelComplete}
          startLevelTimer={progress.startLevelTimer}
          saveQuizScore={progress.saveQuizScore}
          previousLevelData={nav.levelData[nav.currentLevel - 1] || nav.levelData.customImport}
        />
        {assistant}
      </>
    );
  }

  // ─── Start screen (default) ───────────────────────────────────────
  if (nav.currentScreen === 'start' && !progress.isLoaded) {
    return null;
  }

  if (nav.currentScreen === 'start' && !progress.gameState.playerName) {
    return (
      <WelcomeScreen
        onEnter={progress.startNewGame}
        soundEnabled={sounds.soundEnabled}
        toggleSound={sounds.toggleSound}
        darkMode={nav.darkMode}
        toggleDarkMode={nav.toggleDarkMode}
      />
    );
  }

  return (
    <>
      <StartScreen
        onStart={nav.handleStartGame}
        gameState={progress.gameState}
        leaderboard={progress.leaderboard}
        soundEnabled={sounds.soundEnabled}
        toggleSound={sounds.toggleSound}
        darkMode={nav.darkMode}
        toggleDarkMode={nav.toggleDarkMode}
        onLevelClick={nav.handleLevelClick}
        isLevelUnlocked={progress.isLevelUnlocked}
        getLevelProgress={progress.getLevelProgress}
        getRecommendedLevel={progress.getRecommendedLevel}
        onDataImport={nav.handleDataImport}
        onAssistantChange={progress.setAssistantId}
        onStartOver={nav.handleStartOver}
      />
      {assistant}
    </>
  );
};

const Index = () => (
  <GuideSurfaceProvider>
    <IndexContent />
  </GuideSurfaceProvider>
);

export default Index;
