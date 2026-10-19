import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Player } from '../../types/game';

interface GameOverModalProps {
  winner: Player | null;
  onRestart: () => void;
  onExit: () => void;
  roundNumber: number;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  onRestart,
  onExit,
  roundNumber,
}) => {
  if (!winner) return null;

  const isLocalWinner = winner.isLocalUser;

  useEffect(() => {
    if (isLocalWinner) {
      // Fire confetti celebration
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isLocalWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className="relative max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isLocalWinner ? 'bg-amber-500/30' : 'bg-rose-500/20'}`} />

        {/* Trophy / Avatar */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-xl mx-auto">
            {isLocalWinner ? '🏆' : winner.avatar}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow">
            {isLocalWinner ? 'VICTORY!' : 'ROUND WINNER'}
          </div>
        </div>

        <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mt-2">
          {isLocalWinner ? 'YOU WON!' : `${winner.name} WINS!`}
        </h2>

        <p className="text-slate-300 text-sm mt-2 max-w-xs mx-auto">
          {isLocalWinner
            ? `Spectacular play! You cleared all your cards and scored ${winner.score} points!`
            : `${winner.name} emptied their hand first and claimed the round.`}
        </p>

        <div className="mt-6 py-3 px-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-around text-xs text-slate-300">
          <div>
            <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Round</span>
            <span className="font-bold text-white text-base">#{roundNumber}</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Round Score</span>
            <span className="font-bold text-amber-400 text-base">+{winner.score} pts</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRestart}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-display font-bold text-sm tracking-wider uppercase shadow-neon-red border border-yellow-300"
          >
            Play Next Round
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onExit}
            className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-sm tracking-wider uppercase border border-slate-600"
          >
            Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
