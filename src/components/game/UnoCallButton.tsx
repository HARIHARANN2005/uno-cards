import React from 'react';
import { motion } from 'framer-motion';

interface UnoCallButtonProps {
  handCount: number;
  calledUno: boolean;
  onCallUno: () => void;
  disabled?: boolean;
}

export const UnoCallButton: React.FC<UnoCallButtonProps> = ({
  handCount,
  calledUno,
  onCallUno,
  disabled = false,
}) => {
  const isUrgent = handCount <= 2 && !calledUno;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isUrgent ? { scale: [1, 1.08, 1] } : undefined}
      transition={isUrgent ? { repeat: Infinity, duration: 0.9 } : undefined}
      onClick={onCallUno}
      disabled={disabled || (calledUno && handCount === 1)}
      className={`
        relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-display font-black text-sm sm:text-base tracking-wider uppercase
        shadow-xl transition-all duration-200 border-2 select-none
        ${calledUno && handCount === 1
          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 cursor-default'
          : isUrgent
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 border-yellow-300 text-white shadow-neon-red ring-4 ring-yellow-400/40'
            : 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-300'
        }
      `}
    >
      <div className="flex items-center space-x-2">
        <span>{calledUno && handCount === 1 ? '✓ UNO CALLED' : '🚨 CALL UNO!'}</span>
      </div>
    </motion.button>
  );
};
