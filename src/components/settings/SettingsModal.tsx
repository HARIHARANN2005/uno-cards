import React from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, Eye, Zap, Sliders } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';
import { useSettingsStore, AnimationSpeed } from '../../stores/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    masterVolume,
    sfxVolume,
    musicVolume,
    isMuted,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    toggleMute,
  } = useAudioStore();

  const {
    animationSpeed,
    colorblindMode,
    houseRules,
    setAnimationSpeed,
    setColorblindMode,
    updateHouseRules,
  } = useSettingsStore();

  if (!isOpen) return null;

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
          <Sliders className="w-6 h-6 text-cyan-400" />
          <span>Game Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">Customize audio, accessibility, and house rules</p>

        <div className="space-y-6">
          {/* Audio Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Audio & Sound</span>
              </span>
              <button
                onClick={toggleMute}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                  isMuted ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isMuted ? 'MUTED' : 'UNMUTED'}
              </button>
            </h3>

            {/* Master Volume */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Master Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={e => setMasterVolume(parseFloat(e.target.value))}
                className="w-36 accent-indigo-500"
              />
            </div>

            {/* SFX Volume */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Sound Effects</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                onChange={e => setSfxVolume(parseFloat(e.target.value))}
                className="w-36 accent-indigo-500"
              />
            </div>

            {/* Music Volume */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Arcade Music</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={e => setMusicVolume(parseFloat(e.target.value))}
                className="w-36 accent-indigo-500"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-800" />

          {/* Visuals & Accessibility */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Accessibility & Motion</span>
            </h3>

            {/* Colorblind Mode Toggle */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Colorblind Mode</span>
                <span className="text-[11px] text-slate-400 block">Adds unique geometric symbols on cards (● Circle, ▲ Triangle, ■ Square, ◆ Diamond)</span>
              </div>
              <input
                type="checkbox"
                checked={colorblindMode}
                onChange={e => setColorblindMode(e.target.checked)}
                className="w-5 h-5 rounded accent-cyan-500"
              />
            </label>

            {/* Animation Speed */}
            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs font-semibold text-white block mb-2">Animation Speed</span>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'fast', 'reduced'] as AnimationSpeed[]).map(speed => (
                  <button
                    key={speed}
                    onClick={() => setAnimationSpeed(speed)}
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      animationSpeed === speed
                        ? 'bg-cyan-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-800" />

          {/* Optional House Rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Optional House Rules</span>
            </h3>

            {/* Stacking */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Draw-Card Stacking</span>
                <span className="text-[11px] text-slate-400 block">Stack +2 on +2 or +4 on +4 to pass the penalty to the next player</span>
              </div>
              <input
                type="checkbox"
                checked={houseRules.stackDrawCards}
                onChange={e => updateHouseRules({ stackDrawCards: e.target.checked })}
                className="w-5 h-5 rounded accent-amber-500"
              />
            </label>

            {/* Seven-0 */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Seven-Zero Hand Swap</span>
                <span className="text-[11px] text-slate-400 block">Playing 0 rotates all hands in play direction</span>
              </div>
              <input
                type="checkbox"
                checked={houseRules.sevenZeroRule}
                onChange={e => updateHouseRules({ sevenZeroRule: e.target.checked })}
                className="w-5 h-5 rounded accent-amber-500"
              />
            </label>

            {/* Jump In */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Jump-In Rule</span>
                <span className="text-[11px] text-slate-400 block">Play out of turn if you hold an exact identical card (same color & value)</span>
              </div>
              <input
                type="checkbox"
                checked={houseRules.jumpIn}
                onChange={e => updateHouseRules({ jumpIn: e.target.checked })}
                className="w-5 h-5 rounded accent-amber-500"
              />
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
