import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LastAction } from '../../types/game';

interface ActionBannerProps {
  lastAction: LastAction | null;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({ lastAction }) => {
  if (!lastAction) return null;

  const typeGlows: Record<string, string> = {
    play: 'border-indigo-500/50 bg-indigo-950/70 text-indigo-100',
    draw: 'border-slate-500/50 bg-slate-900/80 text-slate-200',
    skip: 'border-cyan-500/50 bg-cyan-950/70 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    reverse: 'border-amber-500/50 bg-amber-950/70 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    draw2: 'border-red-500/50 bg-red-950/70 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    wild: 'border-purple-500/50 bg-purple-950/70 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    wild4: 'border-fuchsia-500/50 bg-fuchsia-950/70 text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.5)]',
    uno: 'border-yellow-400 bg-red-900/80 text-yellow-200 shadow-neon-red font-black',
    penalty: 'border-rose-500 bg-rose-950/80 text-rose-200',
  };

  const currentStyle = typeGlows[lastAction.type] || typeGlows.play;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${lastAction.timestamp}-${lastAction.message}`}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm backdrop-blur-md shadow-lg pointer-events-none ${currentStyle} flex items-center space-x-2`}
      >
        <span>{lastAction.message}</span>
      </motion.div>
    </AnimatePresence>
  );
};
