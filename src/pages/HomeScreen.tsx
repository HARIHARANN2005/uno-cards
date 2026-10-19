import React from 'react';
import { motion } from 'framer-motion';
import { Play, HelpCircle, Trophy, Settings as SettingsIcon, Volume2, VolumeX, Music, Sparkles, Bot } from 'lucide-react';
import { useAudioStore } from '../stores/audioStore';
import { Card } from '../components/cards/Card';
import { Card as CardModel } from '../types/cards';

interface HomeScreenProps {
  onPlayNow: () => void;
  onOpenModes: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlayNow,
  onOpenModes,
  onOpenRules,
  onOpenSettings,
  onOpenStats,
}) => {
  const { isMuted, toggleMute, isMusicPlaying, toggleMusic, playSfx } = useAudioStore();

  // Floating decorative card deck
  const floatingCards: Array<{ card: CardModel; rotate: number; x: number; y: number; delay: number }> = [
    { card: { id: 'h-1', color: 'red', type: 'number', value: '7', scoreValue: 7 }, rotate: -15, x: -90, y: -20, delay: 0 },
    { card: { id: 'h-2', color: 'blue', type: 'skip', value: 'skip', scoreValue: 20 }, rotate: 12, x: 90, y: -10, delay: 0.5 },
    { card: { id: 'h-3', color: 'yellow', type: 'draw2', value: 'draw2', scoreValue: 20 }, rotate: -8, x: -45, y: 40, delay: 0.2 },
    { card: { id: 'h-4', color: 'wild', type: 'wild4', value: 'wild4', scoreValue: 50 }, rotate: 18, x: 55, y: 50, delay: 0.7 },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-game-bg text-slate-100 overflow-hidden px-4 py-6">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

      {/* Top Bar with Audio Controls */}
      <header className="relative z-20 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-500 via-amber-400 to-cyan-400 flex items-center justify-center font-display font-black text-white text-base shadow-lg">
            C
          </div>
          <span className="font-display font-black text-lg tracking-wider text-white">
            COLOR CLASH
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              playSfx('click');
              toggleMusic();
            }}
            title="Music"
            className={`p-2.5 rounded-2xl transition border ${
              isMusicPlaying
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              playSfx('click');
              toggleMute();
            }}
            title="SFX"
            className={`p-2.5 rounded-2xl transition border ${
              isMuted
                ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Hero Center Section */}
      <main className="relative z-20 my-auto flex flex-col items-center text-center max-w-2xl w-full py-8">
        {/* Floating Animated Cards Showcase */}
        <div className="relative w-64 h-48 sm:w-80 sm:h-56 mb-8 flex items-center justify-center">
          {floatingCards.map(({ card, rotate, x, y, delay }, idx) => (
            <motion.div
              key={card.id}
              animate={{
                y: [y, y - 12, y],
                rotate: [rotate, rotate + (idx % 2 === 0 ? 3 : -3), rotate],
              }}
              transition={{
                duration: 4 + idx * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
              }}
              style={{
                position: 'absolute',
                transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
                zIndex: idx + 10,
              }}
            >
              <Card card={card} size="md" disabled />
            </motion.div>
          ))}
        </div>

        {/* Hero Title & Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Next-Gen Animated Card Battle</span>
          </div>

          <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tight text-white mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400">
              COLOR
            </span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              CLASH
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
            The ultimate fast-paced, animated card showdown. Outsmart clever AI bots, pass-and-play with friends, or host multiplayer rooms.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playSfx('play');
              onPlayNow();
            }}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-display font-black text-lg sm:text-xl tracking-wider uppercase shadow-neon-red border-2 border-yellow-300 flex items-center justify-center space-x-3 transition"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>QUICK PLAY</span>
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSfx('click');
                onOpenModes();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-display font-bold text-xs sm:text-sm tracking-wide uppercase border border-slate-700/80 flex items-center justify-center space-x-2 transition shadow-lg"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Modes</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSfx('click');
                onOpenStats();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-display font-bold text-xs sm:text-sm tracking-wide uppercase border border-slate-700/80 flex items-center justify-center space-x-2 transition shadow-lg"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Stats</span>
            </motion.button>
          </div>
        </div>
      </main>

      {/* Footer Utility Navigation */}
      <footer className="relative z-20 w-full max-w-5xl flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              playSfx('click');
              onOpenRules();
            }}
            className="flex items-center space-x-1 hover:text-slate-300 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>How to Play</span>
          </button>
          <button
            onClick={() => {
              playSfx('click');
              onOpenSettings();
            }}
            className="flex items-center space-x-1 hover:text-slate-300 transition"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-600">
          v1.0.0 • Color Clash
        </span>
      </footer>
    </div>
  );
};
