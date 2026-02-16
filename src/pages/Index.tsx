import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGameProgress, BADGES } from '@/hooks/useGameProgress';
import { StartScreen, GameLauncher, GameComplete } from '@/components/game';
import DataImport from '@/components/game/DataImport';
import SchemaMapper from '@/components/game/SchemaMapper';
import QuizModal from '@/components/game/QuizModal';

type GameScreen = 'start' | 'playing' | 'complete' | 'dataImport' | 'schemaMapper' | 'quiz';

const Index = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('start');
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [levelData, setLevelData] = useState<Record<number | string, unknown>>({});
  const [quizLevel, setQuizLevel] = useState<number | null>(null);
  const [pendingScore, setPendingScore] = useState<number>(0);

  const {
    gameState,
    leaderboard,
    startNewGame,
    addScore,
    completeLevel,
    startLevelTimer,
    saveQuizScore,
    updateLeaderboard,
    resetProgress,
    isLevelUnlocked,
  } = useGameProgress();

  // Sound effects (simple beeps)
  const playSound = useCallback((type: 'success' | 'fail' | 'drop' | 'levelComplete' | 'badgeUnlock') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const sounds: Record<string, { freq: number; duration: number; type: OscillatorType }> = {
      success: { freq: 880, duration: 0.1, type: 'sine' },
      fail: { freq: 220, duration: 0.2, type: 'square' },
      drop: { freq: 440, duration: 0.05, type: 'sine' },
      levelComplete: { freq: 660, duration: 0.3, type: 'triangle' },
      badgeUnlock: { freq: 1000, duration: 0.4, type: 'sine' },
    };
    
    const sound = sounds[type];
    oscillator.frequency.value = sound.freq;
    oscillator.type = sound.type;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, sound.duration * 1000);
  }, [soundEnabled]);

  const playSuccess = useCallback(() => playSound('success'), [playSound]);
  const playFail = useCallback(() => playSound('fail'), [playSound]);
  const playDrop = useCallback(() => playSound('drop'), [playSound]);
  const playLevelComplete = useCallback(() => playSound('levelComplete'), [playSound]);
  const playBadgeUnlock = useCallback(() => playSound('badgeUnlock'), [playSound]);

  // Handle game start
  const handleStartGame = useCallback((playerName: string) => {
    startNewGame(playerName);
    toast({
      title: `Witaj, ${playerName}! 🦎`,
      description: "Twoja misja Data Rangera właśnie się rozpoczęła!",
    });
  }, [startNewGame, toast]);

  // Handle level selection from start screen
  const handleLevelClick = useCallback((levelId: number) => {
    if (isLevelUnlocked(levelId) && gameState.playerName) {
      setCurrentLevel(levelId);
      setCurrentScreen('playing');
      startLevelTimer();
    }
  }, [isLevelUnlocked, gameState.playerName, startLevelTimer]);

  // Level names for toast messages
  const levelNames: Record<number, string> = {
    1: 'Core Forge',
    2: 'Extension Nexus',
    3: 'Package Seal',
    4: 'Validate (Final Boss)'
  };

  // Handle level completion - auto-progress to next stage
  const handleLevelComplete = useCallback((score: number, data?: unknown) => {
    if (currentLevel === null) return;

    if (data) {
      setLevelData(prev => ({ ...prev, [currentLevel]: data }));
    }

    completeLevel(currentLevel, score);
    updateLeaderboard();
    setPendingScore(score);
    setQuizLevel(currentLevel);
    setCurrentScreen('quiz');
  }, [currentLevel, completeLevel, updateLeaderboard]);

  // Handle quiz completion — progress to next level or finish
  const handleQuizComplete = useCallback((quizScore: number) => {
    if (quizLevel === null) return;
    saveQuizScore(quizLevel, quizScore);
  }, [quizLevel, saveQuizScore]);

  const handleQuizClose = useCallback(() => {
    if (quizLevel === null) return;
    const nextLevel = quizLevel + 1;

    if (quizLevel >= 4) {
      toast({
        title: `${levelNames[quizLevel]} ukończony! 🏆`,
        description: `Wszystkie misje zakończone!`,
      });
      setCurrentScreen('complete');
    } else {
      toast({
        title: `${levelNames[quizLevel]} ukończony! 🎉`,
        description: `Przechodzisz do: ${levelNames[nextLevel]}`,
      });
      setCurrentLevel(nextLevel);
      setCurrentScreen('playing');
      startLevelTimer();
    }
    setQuizLevel(null);
  }, [quizLevel, toast, startLevelTimer]);

  // Handle going back to menu
  const handleBackToMenu = useCallback(() => {
    setCurrentScreen('start');
    setCurrentLevel(null);
  }, []);

  // Handle restart game
  const handleRestart = useCallback(() => {
    resetProgress();
    setCurrentScreen('start');
    setCurrentLevel(null);
    setLevelData({});
    setQuizLevel(null);
  }, [resetProgress]);

  // Toggle functions
  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);
  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  // Handle data import
  const handleDataImport = useCallback(() => {
    setCurrentScreen('dataImport');
  }, []);

  const handleImportComplete = useCallback((data: any[], columns: string[], fileName: string) => {
    setLevelData(prev => ({ ...prev, customImport: { data, columns, fileName } }));
    toast({
      title: "Dane zaimportowane! 📊",
      description: `Wczytano ${data.length} wierszy z pliku ${fileName}`,
    });
    setCurrentScreen('schemaMapper');
  }, [toast]);

  const handleSchemaMappingComplete = useCallback((mappings: Record<string, string>, schema: string) => {
    setLevelData(prev => ({ ...prev, schemaMappings: mappings, selectedSchema: schema }));
    toast({
      title: "Mapowanie ukończone! ✅",
      description: `Zmapowano pola do schematu ${schema}`,
    });
    // Could go to validation or next step
    setCurrentScreen('start');
  }, [toast]);

  // Render based on current screen
  if (currentScreen === 'complete') {
    return (
      <GameComplete
        gameState={gameState}
        badges={BADGES}
        onRestart={handleRestart}
        playBadgeUnlock={playBadgeUnlock}
      />
    );
  }

  if (currentScreen === 'dataImport') {
    return (
      <DataImport
        onBack={handleBackToMenu}
        onImportComplete={handleImportComplete}
      />
    );
  }

  if (currentScreen === 'schemaMapper') {
    const importData = levelData.customImport as { data: any[]; columns: string[]; fileName: string } | undefined;
    if (importData) {
      return (
        <SchemaMapper
          columns={importData.columns}
          data={importData.data}
          fileName={importData.fileName}
          onBack={() => setCurrentScreen('dataImport')}
          onComplete={handleSchemaMappingComplete}
        />
      );
    }
  }

  if (currentScreen === 'quiz' && quizLevel !== null) {
    return (
      <QuizModal
        levelNumber={quizLevel}
        onComplete={handleQuizComplete}
        onClose={handleQuizClose}
      />
    );
  }

  if (currentScreen === 'playing' && currentLevel !== null) {
    return (
      <GameLauncher
        levelId={currentLevel}
        gameState={gameState}
        onComplete={handleLevelComplete}
        onClose={handleBackToMenu}
        addScore={addScore}
        playSuccess={playSuccess}
        playFail={playFail}
        playDrop={playDrop}
        playLevelComplete={playLevelComplete}
        startLevelTimer={startLevelTimer}
        saveQuizScore={saveQuizScore}
        previousLevelData={levelData[currentLevel - 1] || levelData.customImport}
      />
    );
  }

  // Start screen
  return (
    <StartScreen
      onStart={handleStartGame}
      gameState={gameState}
      leaderboard={leaderboard}
      soundEnabled={soundEnabled}
      toggleSound={toggleSound}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      onLevelClick={handleLevelClick}
      isLevelUnlocked={isLevelUnlocked}
      onDataImport={handleDataImport}
    />
  );
};

export default Index;
