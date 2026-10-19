import { create } from 'zustand';
import { MatchStats } from '../types/game';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

interface StatsState {
  stats: MatchStats;
  achievements: Achievement[];
  recordWin: () => void;
  recordLoss: () => void;
  recordCardPlayed: (isWild: boolean, color?: string) => void;
  recordUnoCall: () => void;
  recordUnoCatch: () => void;
  resetStats: () => void;
}

const STORAGE_KEY = 'color_clash_stats_v1';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'First Blood', description: 'Win your first Color Clash match', icon: '🏆', unlocked: false },
  { id: 'win_streak_3', title: 'On Fire', description: 'Win 3 games in a row', icon: '🔥', unlocked: false },
  { id: 'win_streak_5', title: 'Unstoppable', description: 'Achieve a 5-game win streak', icon: '⚡', unlocked: false },
  { id: 'wild_master', title: 'Wild Maestro', description: 'Play 20 Wild or Wild +4 cards', icon: '🌈', unlocked: false },
  { id: 'uno_shouter', title: 'Fast Fingers', description: 'Call UNO successfully 10 times', icon: '🚨', unlocked: false },
  { id: 'uno_police', title: 'Uno Police', description: 'Catch an opponent who forgot to call UNO', icon: '👮', unlocked: false },
  { id: 'veteran', title: 'Card Shark', description: 'Play 25 complete matches', icon: '🃏', unlocked: false },
];

const getInitialData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      winStreak: 0,
      bestWinStreak: 0,
      cardsPlayed: 0,
      wildCardsPlayed: 0,
      unoCallsSuccessful: 0,
      unoCatchesSuccessful: 0,
      colorCounts: { red: 0, blue: 0, green: 0, yellow: 0 },
    },
    achievements: INITIAL_ACHIEVEMENTS,
  };
};

export const useStatsStore = create<StatsState>((set, get) => {
  const initial = getInitialData();

  const persist = (data: { stats: MatchStats; achievements: Achievement[] }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const checkAchievements = (stats: MatchStats, achievements: Achievement[]) => {
    const updated = achievements.map(ach => {
      if (ach.unlocked) return ach;
      let shouldUnlock = false;

      switch (ach.id) {
        case 'first_win':
          shouldUnlock = stats.gamesWon >= 1;
          break;
        case 'win_streak_3':
          shouldUnlock = stats.winStreak >= 3;
          break;
        case 'win_streak_5':
          shouldUnlock = stats.winStreak >= 5;
          break;
        case 'wild_master':
          shouldUnlock = stats.wildCardsPlayed >= 20;
          break;
        case 'uno_shouter':
          shouldUnlock = stats.unoCallsSuccessful >= 10;
          break;
        case 'uno_police':
          shouldUnlock = stats.unoCatchesSuccessful >= 1;
          break;
        case 'veteran':
          shouldUnlock = stats.gamesPlayed >= 25;
          break;
      }

      if (shouldUnlock) {
        return { ...ach, unlocked: true, unlockedAt: Date.now() };
      }
      return ach;
    });

    return updated;
  };

  return {
    stats: initial.stats,
    achievements: initial.achievements,

    recordWin: () => {
      const current = get().stats;
      const newStreak = current.winStreak + 1;
      const nextStats: MatchStats = {
        ...current,
        gamesPlayed: current.gamesPlayed + 1,
        gamesWon: current.gamesWon + 1,
        winStreak: newStreak,
        bestWinStreak: Math.max(current.bestWinStreak, newStreak),
      };

      const updatedAchievements = checkAchievements(nextStats, get().achievements);
      set({ stats: nextStats, achievements: updatedAchievements });
      persist({ stats: nextStats, achievements: updatedAchievements });
    },

    recordLoss: () => {
      const current = get().stats;
      const nextStats: MatchStats = {
        ...current,
        gamesPlayed: current.gamesPlayed + 1,
        winStreak: 0,
      };

      const updatedAchievements = checkAchievements(nextStats, get().achievements);
      set({ stats: nextStats, achievements: updatedAchievements });
      persist({ stats: nextStats, achievements: updatedAchievements });
    },

    recordCardPlayed: (isWild, color) => {
      const current = get().stats;
      const colorCounts = { ...current.colorCounts };
      if (color && color in colorCounts) {
        colorCounts[color as keyof typeof colorCounts]++;
      }

      const nextStats: MatchStats = {
        ...current,
        cardsPlayed: current.cardsPlayed + 1,
        wildCardsPlayed: isWild ? current.wildCardsPlayed + 1 : current.wildCardsPlayed,
        colorCounts,
      };

      const updatedAchievements = checkAchievements(nextStats, get().achievements);
      set({ stats: nextStats, achievements: updatedAchievements });
      persist({ stats: nextStats, achievements: updatedAchievements });
    },

    recordUnoCall: () => {
      const current = get().stats;
      const nextStats: MatchStats = {
        ...current,
        unoCallsSuccessful: current.unoCallsSuccessful + 1,
      };
      const updatedAchievements = checkAchievements(nextStats, get().achievements);
      set({ stats: nextStats, achievements: updatedAchievements });
      persist({ stats: nextStats, achievements: updatedAchievements });
    },

    recordUnoCatch: () => {
      const current = get().stats;
      const nextStats: MatchStats = {
        ...current,
        unoCatchesSuccessful: current.unoCatchesSuccessful + 1,
      };
      const updatedAchievements = checkAchievements(nextStats, get().achievements);
      set({ stats: nextStats, achievements: updatedAchievements });
      persist({ stats: nextStats, achievements: updatedAchievements });
    },

    resetStats: () => {
      const reset = getInitialData();
      set(reset);
      persist(reset);
    },
  };
});
