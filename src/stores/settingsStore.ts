import { create } from 'zustand';
import { HouseRules } from '../types/game';
import { DEFAULT_HOUSE_RULES } from '../game/engine/gameEngine';

export type AnimationSpeed = 'normal' | 'fast' | 'reduced';

interface SettingsState {
  animationSpeed: AnimationSpeed;
  colorblindMode: boolean;
  playerName: string;
  playerAvatar: string;
  houseRules: HouseRules;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  setColorblindMode: (enabled: boolean) => void;
  setPlayerName: (name: string) => void;
  setPlayerAvatar: (avatar: string) => void;
  updateHouseRules: (rules: Partial<HouseRules>) => void;
}

const STORAGE_KEY = 'color_clash_settings_v1';

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    animationSpeed: 'normal' as AnimationSpeed,
    colorblindMode: false,
    playerName: 'Player 1',
    playerAvatar: '🦊',
    houseRules: { ...DEFAULT_HOUSE_RULES },
  };
};

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = getInitialState();

  const persist = (partial: Partial<SettingsState>) => {
    try {
      const current = get();
      const updated = {
        animationSpeed: partial.animationSpeed ?? current.animationSpeed,
        colorblindMode: partial.colorblindMode ?? current.colorblindMode,
        playerName: partial.playerName ?? current.playerName,
        playerAvatar: partial.playerAvatar ?? current.playerAvatar,
        houseRules: partial.houseRules ?? current.houseRules,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return {
    ...initial,

    setAnimationSpeed: (speed) => {
      set({ animationSpeed: speed });
      persist({ animationSpeed: speed });
    },

    setColorblindMode: (enabled) => {
      set({ colorblindMode: enabled });
      persist({ colorblindMode: enabled });
    },

    setPlayerName: (name) => {
      set({ playerName: name });
      persist({ playerName: name });
    },

    setPlayerAvatar: (avatar) => {
      set({ playerAvatar: avatar });
      persist({ playerAvatar: avatar });
    },

    updateHouseRules: (partialRules) => {
      const nextRules = { ...get().houseRules, ...partialRules };
      set({ houseRules: nextRules });
      persist({ houseRules: nextRules });
    },
  };
});
