import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types/game';
import { CardBack } from '../cards/CardBack';

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right' | 'bottom';
  isBotThinking?: boolean;
  botStatusText?: string | null;
  onCatchUno?: () => void;
  canCatchUno?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  position,
  isBotThinking = false,
  botStatusText = null,
  onCatchUno,
  canCatchUno = false,
}) => {
  return (
    <div className={`relative flex flex-col items-center ${isCurrentTurn ? 'scale-105' : 'opacity-85'} transition-all duration-200`}>
      {/* Bot Thinking Bubble */}
      {isCurrentTurn && isBotThinking && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="absolute -top-10 px-3 py-1 bg-indigo-900/90 border border-indigo-400 text-indigo-200 text-xs rounded-full shadow-lg backdrop-blur-md flex items-center space-x-1.5 whitespace-nowrap z-30"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-medium">{botStatusText || 'Thinking...'}</span>
        </motion.div>
      )}

      {/* UNO Badge */}
      {player.calledUno && player.hand.length === 1 && (
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute -top-7 px-2.5 py-0.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-xs rounded-full shadow-neon-red border border-yellow-300 z-30"
        >
          UNO!
        </motion.div>
      )}

      {/* Catch UNO button */}
      {canCatchUno && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCatchUno}
          className="absolute -top-9 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-full shadow-lg border border-red-300 animate-bounce z-40"
        >
          🚨 CATCH UNO!
        </motion.button>
      )}

      {/* Avatar Container with Turn Halo */}
      <div className="relative">
        {/* Glow halo when it's player's turn */}
        {isCurrentTurn && (
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 opacity-80 blur-sm animate-pulse" />
        )}

        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-800 border-2 ${isCurrentTurn ? 'border-cyan-300' : 'border-slate-600'} flex items-center justify-center text-xl sm:text-2xl shadow-xl overflow-hidden`}>
          <span>{player.avatar}</span>
        </div>

        {/* Card count badge */}
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full border border-white/40 shadow">
          {player.hand.length}
        </div>
      </div>

      {/* Name and difficulty/score */}
      <div className="mt-1.5 flex flex-col items-center">
        <span className="font-semibold text-xs text-slate-200 tracking-wide flex items-center space-x-1">
          <span>{player.name}</span>
          {player.type === 'bot' && (
            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-700/80 text-cyan-300 font-mono">
              {player.difficulty}
            </span>
          )}
        </span>
        <span className="text-[10px] text-slate-400">
          {player.score > 0 ? `${player.score} pts` : `${player.hand.length} cards`}
        </span>
      </div>

      {/* Opponent mini card preview representation */}
      {position !== 'bottom' && (
        <div className="mt-1 flex justify-center -space-x-3 opacity-90">
          {Array.from({ length: Math.min(player.hand.length, 5) }).map((_, idx) => (
            <CardBack key={idx} size="sm" className="scale-75 shadow-sm" />
          ))}
        </div>
      )}
    </div>
  );
};
