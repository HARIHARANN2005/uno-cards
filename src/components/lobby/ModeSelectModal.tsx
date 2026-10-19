import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BotDifficulty } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Bot, Users, Globe, Play, Sparkles, X } from 'lucide-react';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnlineLobby: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  onClose,
  onOpenOnlineLobby,
}) => {
  const { startSoloGame, startPassAndPlayGame } = useGameStore();
  const { houseRules } = useSettingsStore();

  const [selectedTab, setSelectedTab] = useState<'solo' | 'pass-and-play' | 'online'>('solo');
  const [botCount, setBotCount] = useState<number>(3);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [passPlayerCount, setPassPlayerCount] = useState<2 | 3 | 4>(2);

  if (!isOpen) return null;

  const handleLaunchSolo = () => {
    startSoloGame(botCount, botDifficulty, houseRules);
    onClose();
  };

  const handleLaunchPassAndPlay = () => {
    startPassAndPlayGame(passPlayerCount, houseRules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative max-w-xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center space-x-2">
            <span>Select Game Mode</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose how you want to clash colors today
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => setSelectedTab('solo')}
            className={`py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 ${
              selectedTab === 'solo'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Vs Bots</span>
          </button>
          <button
            onClick={() => setSelectedTab('pass-and-play')}
            className={`py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 ${
              selectedTab === 'pass-and-play'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pass & Play</span>
          </button>
          <button
            onClick={() => setSelectedTab('online')}
            className={`py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 ${
              selectedTab === 'online'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Online</span>
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {selectedTab === 'solo' && (
            <motion.div
              key="solo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              {/* Bot Count */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Number of Bot Opponents
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(count => (
                    <button
                      key={count}
                      onClick={() => setBotCount(count)}
                      className={`py-3 rounded-2xl border-2 font-display font-extrabold text-sm transition ${
                        botCount === count
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-neon-blue'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {count} {count === 1 ? 'Bot' : 'Bots'} ({count + 1}P)
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot Difficulty */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Bot Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as BotDifficulty[]).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setBotDifficulty(diff)}
                      className={`py-3 rounded-2xl border-2 font-display font-extrabold text-xs sm:text-sm capitalize transition ${
                        botDifficulty === diff
                          ? diff === 'easy'
                            ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 shadow-neon-green'
                            : diff === 'medium'
                              ? 'border-amber-400 bg-amber-950/60 text-amber-200 shadow-neon-yellow'
                              : 'border-rose-400 bg-rose-950/60 text-rose-200 shadow-neon-red'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleLaunchSolo}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-display font-black text-base tracking-wider uppercase shadow-neon-red border border-yellow-300 flex items-center justify-center space-x-2 transition"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Match</span>
                </button>
              </div>
            </motion.div>
          )}

          {selectedTab === 'pass-and-play' && (
            <motion.div
              key="pass"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Human Players (Single Device)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[2, 3, 4].map(count => (
                    <button
                      key={count}
                      onClick={() => setPassPlayerCount(count as 2 | 3 | 4)}
                      className={`py-3 rounded-2xl border-2 font-display font-extrabold text-sm transition ${
                        passPlayerCount === count
                          ? 'border-indigo-400 bg-indigo-950/60 text-indigo-200 shadow-neon-wild'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-white mb-1">🔒 Hand Privacy Protection</p>
                <p className="text-slate-400">
                  During turns, each player's hand is automatically concealed behind a privacy shield until the next player taps to reveal their cards.
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleLaunchPassAndPlay}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-display font-black text-base tracking-wider uppercase shadow-neon-wild border border-purple-300 flex items-center justify-center space-x-2 transition"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Pass & Play</span>
                </button>
              </div>
            </motion.div>
          )}

          {selectedTab === 'online' && (
            <motion.div
              key="online"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="p-5 bg-gradient-to-br from-indigo-950/40 to-slate-950 rounded-2xl border border-indigo-500/30 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-white text-base">Realtime Multiplayer Rooms</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Create a private room with a shareable 6-digit room code or join friends directly.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenOnlineLobby();
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-display font-black text-base tracking-wider uppercase shadow-neon-blue border border-cyan-300 flex items-center justify-center space-x-2 transition"
                >
                  <Globe className="w-5 h-5" />
                  <span>Open Multiplayer Lobby</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
