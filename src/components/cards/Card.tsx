import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardModel } from '../../types/cards';
import { useSettingsStore } from '../../stores/settingsStore';

interface CardProps {
  card: CardModel;
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  rotation?: number;
}

export const Card: React.FC<CardProps> = ({
  card,
  isPlayable = false,
  isSelected = false,
  onClick,
  size = 'md',
  disabled = false,
  className = '',
  rotation = 0,
}) => {
  const { colorblindMode } = useSettingsStore();

  // Color schemes with gradients, glows and borders
  const colorStyles: Record<string, { bg: string; border: string; glow: string; text: string; lightBg: string }> = {
    red: {
      bg: 'from-red-600 via-rose-600 to-red-700',
      border: 'border-red-400',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
      text: 'text-red-600',
      lightBg: 'bg-red-50',
    },
    blue: {
      bg: 'from-blue-600 via-sky-600 to-blue-700',
      border: 'border-blue-400',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
    },
    green: {
      bg: 'from-emerald-600 via-green-600 to-teal-700',
      border: 'border-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
    },
    yellow: {
      bg: 'from-amber-500 via-yellow-500 to-amber-600',
      border: 'border-yellow-300',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]',
      text: 'text-amber-500',
      lightBg: 'bg-amber-50',
    },
    wild: {
      bg: 'from-purple-800 via-indigo-900 to-slate-900',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.7)]',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
    },
  };

  const currentColor = card.assignedColor || card.color;
  const style = colorStyles[currentColor] || colorStyles.wild;

  // Colorblind symbol shapes
  const colorblindSymbols: Record<string, string> = {
    red: '●',     // Circle
    blue: '▲',    // Triangle
    green: '■',   // Square
    yellow: '◆',  // Diamond
    wild: '★',    // Star
  };

  const sizeClasses = {
    sm: 'w-14 h-20 text-xs rounded-lg p-1',
    md: 'w-20 h-28 sm:w-24 sm:h-36 text-sm rounded-xl p-1.5 sm:p-2',
    lg: 'w-28 h-40 sm:w-32 sm:h-48 text-base rounded-2xl p-2.5',
  }[size];

  // Render Card Icon / Value Center
  const renderCardContent = () => {
    switch (card.type) {
      case 'skip':
        return (
          <svg className="w-8 h-8 sm:w-11 sm:h-11 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
          </svg>
        );

      case 'reverse':
        return (
          <svg className="w-8 h-8 sm:w-11 sm:h-11 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 0 1 14.93-4" />
            <polyline points="19 3 19 8 14 8" />
            <path d="M20 12a8 8 0 0 1-14.93 4" />
            <polyline points="5 21 5 16 10 16" />
          </svg>
        );

      case 'draw2':
        return (
          <div className="flex flex-col items-center justify-center font-display font-black leading-none drop-shadow-md">
            <span className="text-xl sm:text-3xl">+2</span>
          </div>
        );

      case 'wild4':
        return (
          <div className="relative flex flex-col items-center justify-center font-display font-black leading-none">
            {/* 4-color mini quadrants */}
            <div className="grid grid-cols-2 gap-0.5 w-6 h-6 sm:w-8 sm:h-8 mb-0.5 rounded shadow-sm overflow-hidden">
              <div className="bg-red-500" />
              <div className="bg-blue-500" />
              <div className="bg-yellow-400" />
              <div className="bg-emerald-500" />
            </div>
            <span className="text-sm sm:text-xl text-white font-extrabold drop-shadow">+4</span>
          </div>
        );

      case 'wild':
        return (
          <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-inner border border-white/40 transform rotate-45">
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500" />
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-400" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-emerald-500" />
          </div>
        );

      default:
        // Number 0-9
        return (
          <span className="font-display font-black text-2xl sm:text-4xl drop-shadow-md tracking-tighter">
            {card.value}
          </span>
        );
    }
  };

  const cornerLabel = () => {
    switch (card.type) {
      case 'skip': return '⊘';
      case 'reverse': return '⇄';
      case 'draw2': return '+2';
      case 'wild': return 'W';
      case 'wild4': return '+4';
      default: return card.value;
    }
  };

  return (
    <motion.div
      whileHover={!disabled && isPlayable ? { y: -16, scale: 1.05 } : undefined}
      whileTap={!disabled && isPlayable ? { scale: 0.95 } : undefined}
      animate={{
        y: isSelected ? -24 : 0,
        rotate: rotation,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => {
        if (!disabled && onClick) onClick();
      }}
      aria-label={`${card.color} ${card.type} ${card.value}`}
      className={`
        relative select-none flex flex-col justify-between overflow-hidden cursor-pointer
        bg-gradient-to-br ${style.bg} border-2 ${style.border} shadow-card-elevated
        ${isPlayable ? `${style.glow} ring-2 ring-white/60` : 'opacity-85 hover:opacity-100'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${sizeClasses}
        ${className}
      `}
    >
      {/* Subtle glossy card sheen */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />

      {/* Top Left Corner */}
      <div className="flex items-center space-x-0.5 leading-none font-bold text-white z-10">
        <span className="font-display text-xs sm:text-sm drop-shadow">{cornerLabel()}</span>
        {colorblindMode && (
          <span className="text-[10px] opacity-90 drop-shadow ml-0.5">
            {colorblindSymbols[currentColor]}
          </span>
        )}
      </div>

      {/* Center Ellipse / Value Display */}
      <div className="relative self-center my-auto w-[82%] h-[68%] rounded-[48%] bg-white/95 flex items-center justify-center transform -rotate-12 shadow-md">
        <div className={`transform rotate-12 flex items-center justify-center ${style.text}`}>
          {renderCardContent()}
        </div>
      </div>

      {/* Bottom Right Inverted Corner */}
      <div className="flex items-center space-x-0.5 leading-none font-bold text-white z-10 self-end transform rotate-180">
        <span className="font-display text-xs sm:text-sm drop-shadow">{cornerLabel()}</span>
        {colorblindMode && (
          <span className="text-[10px] opacity-90 drop-shadow ml-0.5">
            {colorblindSymbols[currentColor]}
          </span>
        )}
      </div>

      {/* Assigned color indicator if played wild card */}
      {card.assignedColor && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm border border-white/20">
          {card.assignedColor}
        </div>
      )}
    </motion.div>
  );
};
