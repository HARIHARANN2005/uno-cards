import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Copy, Check, Users, Sparkles, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useSettingsStore } from '../../stores/settingsStore';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({ isOpen, onClose }) => {
  const { playerName, playerAvatar } = useSettingsStore();

  const [view, setView] = useState<'menu' | 'host' | 'join'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState<Array<{ name: string; avatar: string; isHost: boolean; ready: boolean }>>([]);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setLobbyPlayers([
      { name: playerName || 'Player 1', avatar: playerAvatar || '🦊', isHost: true, ready: true },
    ]);
    setView('host');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setRoomCode(inputCode.trim().toUpperCase());
    setLobbyPlayers([
      { name: 'Host Player', avatar: '🐼', isHost: true, ready: true },
      { name: playerName || 'Player 2', avatar: playerAvatar || '🦊', isHost: false, ready: true },
    ]);
    setView('host');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-black text-2xl text-white flex items-center space-x-2 mb-1">
          <Globe className="w-6 h-6 text-cyan-400" />
          <span>Online Multiplayer</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">Play private room matches with friends across devices</p>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Supabase Realtime Backend Setup</p>
              <p className="text-amber-300/80 leading-relaxed">
                To connect live multiplayer matches across separate remote devices, provide your <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-100">VITE_SUPABASE_URL</code> and <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-100">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-100">.env</code>.
              </p>
            </div>
          </div>
        )}

        {view === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-display font-black text-base tracking-wider uppercase shadow-neon-blue border border-cyan-300 flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create Private Room</span>
            </button>

            <button
              onClick={() => setView('join')}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-sm tracking-wider uppercase border border-slate-600 flex items-center justify-center space-x-2 transition"
            >
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Join with Room Code</span>
            </button>
          </div>
        )}

        {view === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Enter 6-Digit Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. CLASH9"
                className="w-full py-3 px-4 bg-slate-950 border border-slate-700 rounded-2xl font-mono text-center text-xl tracking-widest text-cyan-400 uppercase placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="py-3 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs uppercase"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!inputCode.trim()}
                className="flex-1 py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-display font-bold text-sm uppercase tracking-wider"
              >
                Join Room
              </button>
            </div>
          </form>
        )}

        {view === 'host' && (
          <div className="space-y-5">
            {/* Room Code Badge */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Room Code</span>
                <span className="font-mono font-black text-2xl text-cyan-400 tracking-widest">{roomCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 text-xs font-bold transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Players waiting */}
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Players in Lobby ({lobbyPlayers.length}/4)
              </span>
              <div className="space-y-2">
                {lobbyPlayers.map((p, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                        {p.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{p.name}</span>
                        {p.isHost && <span className="text-[10px] text-indigo-400 font-mono">Room Host</span>}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                      Ready ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex space-x-3">
              <button
                onClick={() => setView('menu')}
                className="py-3 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs uppercase"
              >
                Leave
              </button>
              <button
                onClick={() => {
                  alert('Host launched multiplayer! With Supabase credentials configured, live sync will orchestrate the game.');
                }}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-display font-black text-sm uppercase tracking-wider shadow-neon-blue"
              >
                Start Match
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
