import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useAudioStore } from '../../stores/audioStore';
import { Card } from '../cards/Card';
import { CardBack } from '../cards/CardBack';
import { CardFan } from '../cards/CardFan';
import { PlayerSeat } from './PlayerSeat';
import { UnoCallButton } from './UnoCallButton';
import { ActionBanner } from './ActionBanner';
import { ColorPickerModal } from './ColorPickerModal';
import { GameOverModal } from './GameOverModal';
import { Volume2, VolumeX, Music, HelpCircle, Settings as SettingsIcon, RotateCw, RotateCcw } from 'lucide-react';
import { BaseCardColor } from '../../types/cards';

interface GameTableProps {
  onOpenRules: () => void;
  onOpenSettings: () => void;
}

export const GameTable: React.FC<GameTableProps> = ({ onOpenRules, onOpenSettings }) => {
  const {
    game,
    selectedCardId,
    pendingWildCardId,
    isBotThinking,
    botStatusText,
    isDealing,
    selectCard,
    playSelectedCard,
    humanDrawCard,
    humanCallUno,
    humanCatchUno,
    confirmPassAndPlayTurn,
    restartGame,
    exitToMenu,
  } = useGameStore();

  const { isMuted, toggleMute, isMusicPlaying, toggleMusic } = useAudioStore();

  if (!game) return null;

  const currentPlayer = game.players[game.currentPlayerIndex];
  const isHumanTurn = currentPlayer.type === 'human';
  const topDiscardCard = game.discardPile[game.discardPile.length - 1];

  // Active color glow helper
  const activeColorGlows: Record<BaseCardColor, string> = {
    red: 'shadow-[0_0_50px_rgba(239,68,68,0.4)] border-red-500/80',
    blue: 'shadow-[0_0_50px_rgba(59,130,246,0.4)] border-blue-500/80',
    green: 'shadow-[0_0_50px_rgba(16,185,129,0.4)] border-emerald-500/80',
    yellow: 'shadow-[0_0_50px_rgba(245,158,11,0.4)] border-yellow-400/80',
  };

  // Split players into opponents and local player
  const opponents = game.players.filter((_, idx) => idx !== (game.mode.startsWith('pass-and-play') ? game.currentPlayerIndex : 0));
  const activeDisplayPlayer = game.mode.startsWith('pass-and-play')
    ? currentPlayer
    : game.players[0];

  return (
    <div className="relative w-full h-screen max-h-screen flex flex-col justify-between bg-game-bg text-slate-100 overflow-hidden select-none">
      {/* Dynamic atmospheric background colors based on active color */}
      <div
        className={`absolute inset-0 opacity-20 transition-all duration-700 pointer-events-none ${
          game.activeColor === 'red' ? 'bg-red-950' :
          game.activeColor === 'blue' ? 'bg-blue-950' :
          game.activeColor === 'green' ? 'bg-emerald-950' : 'bg-amber-950'
        }`}
      />

      {/* Top Navbar Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-2.5 sm:px-6 bg-slate-950/40 backdrop-blur-md border-b border-slate-800/60">
        <div className="flex items-center space-x-3">
          <button
            onClick={exitToMenu}
            className="text-xs uppercase tracking-wider font-display font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Exit
          </button>
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400">
              COLOR CLASH
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              R{game.roundNumber} • T{game.turnCount}
            </span>
          </div>
        </div>

        {/* Center action banner notification */}
        <div className="hidden md:flex items-center justify-center">
          <ActionBanner lastAction={game.lastAction} />
        </div>

        {/* Controls: Sound, Music, Rules, Settings */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMusic}
            title="Toggle Music"
            className={`p-2 rounded-xl transition border ${isMusicPlaying ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMute}
            title="Mute Sound"
            className={`p-2 rounded-xl transition border ${isMuted ? 'bg-rose-600/30 border-rose-500 text-rose-300' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenRules}
            title="How to play"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile action banner */}
      <div className="flex md:hidden justify-center pt-2 z-10 px-2">
        <ActionBanner lastAction={game.lastAction} />
      </div>

      {/* Opponents Area (Top / Sides) */}
      <div className="relative z-10 flex items-center justify-around px-4 pt-2 pb-1 max-w-4xl mx-auto w-full">
        {opponents.map((opp) => (
          <PlayerSeat
            key={opp.id}
            player={opp}
            isCurrentTurn={opp.id === currentPlayer.id}
            position="top"
            isBotThinking={isBotThinking && opp.id === currentPlayer.id}
            botStatusText={botStatusText}
            canCatchUno={game.unoCatchOpportunity?.targetPlayerId === opp.id}
            onCatchUno={() => humanCatchUno(opp.id)}
          />
        ))}
      </div>

      {/* Main Center Table Arena */}
      <div className="relative flex-1 flex items-center justify-center my-auto px-4 z-10">
        {/* Play Table Surface */}
        <div className={`relative w-80 h-48 sm:w-[420px] sm:h-64 rounded-[36px] bg-slate-900/80 border-2 backdrop-blur-md flex items-center justify-center transition-all duration-500 ${activeColorGlows[game.activeColor]}`}>
          {/* Subtle Direction of Play Indicator Ring */}
          <div className="absolute inset-2 sm:inset-4 rounded-[32px] border border-dashed border-slate-700/60 pointer-events-none flex items-center justify-between px-4 sm:px-6">
            <div className="text-slate-500 text-xs flex items-center space-x-1 font-mono uppercase tracking-wider">
              {game.direction === 1 ? <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
              <span className="hidden sm:inline">{game.direction === 1 ? 'Clockwise' : 'Counter'}</span>
            </div>
            <div className="text-slate-500 text-xs flex items-center space-x-1 font-mono uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: game.activeColor === 'yellow' ? '#f59e0b' : game.activeColor === 'blue' ? '#3b82f6' : game.activeColor === 'green' ? '#10b981' : '#ef4444' }} />
              <span className="font-bold text-white capitalize">{game.activeColor}</span>
            </div>
          </div>

          {/* Cards on Center Table: Draw Deck and Discard Pile */}
          <div className="flex items-center space-x-6 sm:space-x-10 z-20">
            {/* Draw Pile Deck */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={isHumanTurn ? { scale: 1.05, y: -4 } : undefined}
                whileTap={isHumanTurn ? { scale: 0.95 } : undefined}
                onClick={() => {
                  if (isHumanTurn) humanDrawCard();
                }}
                className={`relative cursor-pointer transition ${isHumanTurn ? 'ring-2 ring-cyan-400/80 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'opacity-85'}`}
              >
                {/* 3D stacked deck visual representation */}
                <div className="absolute top-1 left-1 w-full h-full bg-slate-800 rounded-xl border border-slate-700 pointer-events-none" />
                <div className="absolute top-2 left-2 w-full h-full bg-slate-900 rounded-xl border border-slate-700 pointer-events-none" />
                <CardBack size="md" count={game.drawPile.length} />
              </motion.div>
              <span className="mt-1 text-[11px] font-semibold text-slate-400">
                {game.pendingDrawCount > 0 ? `Draw +${game.pendingDrawCount}!` : 'Draw Pile'}
              </span>
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {topDiscardCard && (
                  <motion.div
                    key={topDiscardCard.id}
                    initial={{ scale: 1.25, rotate: (Math.random() * 16 - 8), opacity: 0.8 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 18 }}
                  >
                    <Card card={topDiscardCard} size="md" disabled />
                  </motion.div>
                )}
              </div>
              <span className="mt-1 text-[11px] font-semibold text-slate-400">
                Discard Pile
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Controls Bar & Player's Hand */}
      <div className="relative z-20 flex flex-col items-center bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-2 pb-3">
        {/* Interactive Controls Bar: UNO Call button, Play Selected, Draw Card */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-1">
          <UnoCallButton
            handCount={activeDisplayPlayer.hand.length}
            calledUno={activeDisplayPlayer.calledUno}
            onCallUno={humanCallUno}
            disabled={!isHumanTurn}
          />

          {isHumanTurn && selectedCardId && (
            <motion.button
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playSelectedCard()}
              className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-black text-sm sm:text-base tracking-wider uppercase shadow-neon-blue border border-cyan-300"
            >
              Play Card ↵
            </motion.button>
          )}

          {isHumanTurn && !selectedCardId && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={humanDrawCard}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-xs sm:text-sm tracking-wider uppercase border border-slate-600 shadow"
            >
              {game.pendingDrawCount > 0 ? `Take +${game.pendingDrawCount} Cards` : 'Draw Card'}
            </motion.button>
          )}
        </div>

        {/* Hand Area with Pass-and-Play Privacy Barrier */}
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
          {game.passAndPlayPendingConfirmation ? (
            /* Privacy shield between human turns in pass-and-play */
            <div className="py-8 px-6 my-2 text-center bg-slate-900/90 border border-indigo-500/50 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col items-center">
              <span className="text-3xl mb-2">🔒</span>
              <h4 className="font-display font-bold text-lg text-white">
                Pass Device to {currentPlayer.name}
              </h4>
              <p className="text-xs text-slate-400 mb-4 max-w-xs">
                To protect card secrets, hand is hidden until you tap continue.
              </p>
              <button
                onClick={confirmPassAndPlayTurn}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm tracking-wider uppercase shadow-lg border border-indigo-400"
              >
                I'm Ready, Reveal Hand!
              </button>
            </div>
          ) : (
            <CardFan
              cards={activeDisplayPlayer.hand}
              topCard={topDiscardCard}
              activeColor={game.activeColor}
              houseRules={game.houseRules}
              pendingDrawCount={game.pendingDrawCount}
              isCurrentPlayerTurn={isHumanTurn}
              selectedCardId={selectedCardId}
              onSelectCard={selectCard}
              onPlayCard={card => {
                selectCard(card.id);
                playSelectedCard();
              }}
              disabled={isDealing}
            />
          )}
        </div>
      </div>

      {/* Wild Color Picker Modal */}
      <ColorPickerModal
        isOpen={pendingWildCardId !== null || game.status === 'color_picker'}
        onSelectColor={color => playSelectedCard(color)}
      />

      {/* Round & Game Over Victory / Defeat Modal */}
      <GameOverModal
        winner={game.winner}
        onRestart={restartGame}
        onExit={exitToMenu}
        roundNumber={game.roundNumber}
      />
    </div>
  );
};
