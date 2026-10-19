import React from 'react';

interface CardBackProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  count?: number;
}

export const CardBack: React.FC<CardBackProps> = ({ size = 'md', className = '', count }) => {
  const sizeClasses = {
    sm: 'w-14 h-20 text-xs rounded-lg',
    md: 'w-20 h-28 sm:w-24 sm:h-36 text-sm rounded-xl',
    lg: 'w-28 h-40 sm:w-32 sm:h-48 text-base rounded-2xl',
  }[size];

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 shadow-xl overflow-hidden cursor-default transition-all duration-200 ${sizeClasses} ${className}`}
    >
      {/* Background patterned mesh */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:8px_8px]" />

      {/* Decorative center oval */}
      <div className="relative w-[82%] h-[82%] rounded-[40%] bg-gradient-to-tr from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-400/30 flex items-center justify-center transform -rotate-12 shadow-inner">
        {/* Swirl badge */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-cyan-400 drop-shadow-sm text-[11px] sm:text-xs">
            COLOR
          </span>
          <span className="font-display font-extrabold tracking-widest text-white text-[10px] sm:text-[11px] opacity-90">
            CLASH
          </span>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
      <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-400/40" />

      {count !== undefined && (
        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center border border-indigo-300 shadow-md">
          {count}
        </div>
      )}
    </div>
  );
};
