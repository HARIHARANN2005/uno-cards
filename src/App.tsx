import React, { useState } from 'react';
import { useGameStore } from './stores/gameStore';
import { useSettingsStore } from './stores/settingsStore';
import { HomeScreen } from './pages/HomeScreen';
import { GameTable } from './components/game/GameTable';
import { ModeSelectModal } from './components/lobby/ModeSelectModal';
import { HowToPlayModal } from './components/tutorial/HowToPlayModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { StatsModal } from './components/settings/StatsModal';
import { OnlineLobbyModal } from './components/lobby/OnlineLobbyModal';

export const App: React.FC = () => {
  const { game, startSoloGame } = useGameStore();
  const { houseRules } = useSettingsStore();

  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isOnlineLobbyOpen, setIsOnlineLobbyOpen] = useState(false);

  const handleQuickPlay = () => {
    // Quick play launches 1 player vs 3 bots at medium difficulty
    startSoloGame(3, 'medium', houseRules);
  };

  return (
    <div className="min-h-screen bg-game-bg font-sans text-slate-100 antialiased select-none">
      {/* Either Home Screen or Active Game Table */}
      {game ? (
        <GameTable
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <HomeScreen
          onPlayNow={handleQuickPlay}
          onOpenModes={() => setIsModeSelectOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
        />
      )}

      {/* Overlays / Modals */}
      <ModeSelectModal
        isOpen={isModeSelectOpen}
        onClose={() => setIsModeSelectOpen(false)}
        onOpenOnlineLobby={() => setIsOnlineLobbyOpen(true)}
      />

      <HowToPlayModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <OnlineLobbyModal
        isOpen={isOnlineLobbyOpen}
        onClose={() => setIsOnlineLobbyOpen(false)}
      />
    </div>
  );
};

export default App;
