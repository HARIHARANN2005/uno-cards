import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Flame, Award } from 'lucide-react';
import { useStatsStore } from '../../stores/statsStore';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { stats, achievements } = useStatsStore();

  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const totalColors = (stats.colorCounts.red + stats.colorCounts.blue + stats.colorCounts.green + stats.colorCounts.yellow) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-black text-2xl text-white flex items-center space-x-2 mb-1">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>Stats & Achievements</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">Track your career progress in Color Clash</p>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Win Rate</span>
            <span className="font-display font-black text-xl text-emerald-400">{winRate}%</span>
            <span className="block text-[10px] text-slate-500">{stats.gamesWon}/{stats.gamesPlayed} Won</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Win Streak</span>
            <div className="flex items-center justify-center space-x-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-display font-black text-xl text-amber-400">{stats.winStreak}</span>
            </div>
            <span className="block text-[10px] text-slate-500">Best: {stats.bestWinStreak}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cards Played</span>
            <span className="font-display font-black text-xl text-cyan-400">{stats.cardsPlayed}</span>
            <span className="block text-[10px] text-slate-500">{stats.wildCardsPlayed} Wilds</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">UNO Calls</span>
            <span className="font-display font-black text-xl text-rose-400">{stats.unoCallsSuccessful}</span>
            <span className="block text-[10px] text-slate-500">{stats.unoCatchesSuccessful} Catches</span>
          </div>
        </div>

        {/* Color Affinity Breakdown */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 mb-6">
          <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Color Distribution Played
          </span>
          <div className="w-full h-3 rounded-full flex overflow-hidden mb-2 bg-slate-800">
            <div style={{ width: `${(stats.colorCounts.red / totalColors) * 100}%` }} className="bg-red-500 transition-all" />
            <div style={{ width: `${(stats.colorCounts.blue / totalColors) * 100}%` }} className="bg-blue-500 transition-all" />
            <div style={{ width: `${(stats.colorCounts.green / totalColors) * 100}%` }} className="bg-emerald-500 transition-all" />
            <div style={{ width: `${(stats.colorCounts.yellow / totalColors) * 100}%` }} className="bg-amber-400 transition-all" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500" /><span>Red: {stats.colorCounts.red}</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-blue-500" /><span>Blue: {stats.colorCounts.blue}</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span>Green: {stats.colorCounts.green}</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-400" /><span>Yellow: {stats.colorCounts.yellow}</span></span>
          </div>
        </div>

        {/* Achievements List */}
        <div>
          <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Achievements</span>
          </span>
          <div className="space-y-2">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border flex items-center space-x-3 transition ${
                  ach.unlocked
                    ? 'bg-indigo-950/40 border-indigo-500/40'
                    : 'bg-slate-950/30 border-slate-800/80 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  ach.unlocked ? 'bg-indigo-600/30 border border-indigo-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  {ach.unlocked ? ach.icon : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{ach.title}</span>
                    {ach.unlocked && (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
