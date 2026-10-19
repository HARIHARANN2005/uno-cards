import { create } from 'zustand';
import { soundEngine } from '../audio/soundEngine';
import { musicEngine } from '../audio/musicEngine';

interface AudioState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  isMuted: boolean;
  isMusicPlaying: boolean;
  setMasterVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleMusic: () => void;
  playSfx: (type: 'select' | 'play' | 'draw' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'uno' | 'victory' | 'defeat' | 'click') => void;
}

const STORAGE_KEY = 'color_clash_audio_v1';

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    masterVolume: 1.0,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    isMuted: false,
    isMusicPlaying: false,
  };
};

export const useAudioStore = create<AudioState>((set, get) => {
  const initial = getInitialState();

  // Apply initial values to engines
  soundEngine.setMasterVolume(initial.masterVolume);
  soundEngine.setSfxVolume(initial.sfxVolume);
  soundEngine.setMuted(initial.isMuted);
  musicEngine.setVolume(initial.musicVolume);
  musicEngine.setMuted(initial.isMuted);

  const persist = (partial: Partial<AudioState>) => {
    try {
      const current = get();
      const updated = {
        masterVolume: partial.masterVolume ?? current.masterVolume,
        sfxVolume: partial.sfxVolume ?? current.sfxVolume,
        musicVolume: partial.musicVolume ?? current.musicVolume,
        isMuted: partial.isMuted ?? current.isMuted,
        isMusicPlaying: partial.isMusicPlaying ?? current.isMusicPlaying,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return {
    ...initial,

    setMasterVolume: (vol: number) => {
      soundEngine.setMasterVolume(vol);
      set({ masterVolume: vol });
      persist({ masterVolume: vol });
    },

    setSfxVolume: (vol: number) => {
      soundEngine.setSfxVolume(vol);
      set({ sfxVolume: vol });
      persist({ sfxVolume: vol });
    },

    setMusicVolume: (vol: number) => {
      musicEngine.setVolume(vol);
      set({ musicVolume: vol });
      persist({ musicVolume: vol });
    },

    toggleMute: () => {
      const nextMuted = !get().isMuted;
      soundEngine.setMuted(nextMuted);
      musicEngine.setMuted(nextMuted);
      set({ isMuted: nextMuted });
      persist({ isMuted: nextMuted });
    },

    toggleMusic: () => {
      const isPlaying = musicEngine.toggle();
      set({ isMusicPlaying: isPlaying });
      persist({ isMusicPlaying: isPlaying });
    },

    playSfx: (type) => {
      switch (type) {
        case 'select': soundEngine.playSelect(); break;
        case 'play': soundEngine.playCardPlay(); break;
        case 'draw': soundEngine.playDraw(); break;
        case 'skip': soundEngine.playSkip(); break;
        case 'reverse': soundEngine.playReverse(); break;
        case 'draw2': soundEngine.playDrawTwo(); break;
        case 'wild': soundEngine.playWild(); break;
        case 'uno': soundEngine.playUnoAlert(); break;
        case 'victory': soundEngine.playVictory(); break;
        case 'defeat': soundEngine.playDefeat(); break;
        case 'click': soundEngine.playClick(); break;
      }
    },
  };
});
