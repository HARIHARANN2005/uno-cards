import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCardColor } from '../../types/cards';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: BaseCardColor) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, onSelectColor }) => {
  if (!isOpen) return null;

  const colors: Array<{ color: BaseCardColor; label: string; bg: string; border: string; glow: string }> = [
    { color: 'red', label: 'RED', bg: 'bg-red-500 hover:bg-red-400', border: 'border-red-300', glow: 'shadow-neon-red' },
    { color: 'blue', label: 'BLUE', bg: 'bg-blue-500 hover:bg-blue-400', border: 'border-blue-300', glow: 'shadow-neon-blue' },
    { color: 'green', label: 'GREEN', bg: 'bg-emerald-500 hover:bg-emerald-400', border: 'border-emerald-300', glow: 'shadow-neon-green' },
    { color: 'yellow', label: 'YELLOW', bg: 'bg-amber-400 hover:bg-amber-300 text-slate-950', border: 'border-yellow-200', glow: 'shadow-neon-yellow' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative max-w-sm w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center"
        >
          <div className="mb-5">
            <h3 className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400">
              CHOOSE A COLOR
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select the active color for the next player
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {colors.map(({ color, label, bg, border, glow }) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.06, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectColor(color)}
                className={`h-24 sm:h-28 rounded-2xl ${bg} ${border} border-2 ${glow} flex flex-col items-center justify-center font-display font-black text-lg tracking-wider text-white transition-all shadow-lg`}
              >
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
