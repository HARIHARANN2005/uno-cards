import { create } from 'zustand';
import { BaseCardColor } from '../types/cards';
import { GameState, GameMode, BotDifficulty, HouseRules } from '../types/game';
import {
  initializeGame,
  executePlayCard,
  executeDrawCard,
  executeCallUno,
  executeCatchUno,
} from '../game/engine/gameEngine';
import { computeBotMove, checkBotCatchUno } from '../game/bots/botAI';
import { useAudioStore } from './audioStore';
import { useStatsStore } from './statsStore';

interface GameStoreState {
  game: GameState | null;
  selectedCardId: string | null;
  isBotThinking: boolean;
  botStatusText: string | null;
  pendingWildCardId: string | null;
  isDealing: boolean;

  // Actions
  startSoloGame: (botCount: number, difficulty: BotDifficulty, houseRules?: Partial<HouseRules>) => void;
  startPassAndPlayGame: (playerCount: 2 | 3 | 4, houseRules?: Partial<HouseRules>) => void;
  selectCard: (cardId: string | null) => void;
  playSelectedCard: (chosenColor?: BaseCardColor) => void;
  humanDrawCard: () => void;
  humanCallUno: () => void;
  humanCatchUno: (targetId: string) => void;
  confirmPassAndPlayTurn: () => void;
  restartGame: () => void;
  exitToMenu: () => void;
}

let botTimeoutId: number | null = null;
let unoCatchTimeoutId: number | null = null;

export const useGameStore = create<GameStoreState>((set, get) => {
  const triggerAudio = (type: Parameters<ReturnType<typeof useAudioStore.getState>['playSfx']>[0]) => {
    useAudioStore.getState().playSfx(type);
  };

  /**
   * Automatically executes the bot's turn if current player is a bot.
   */
  const checkAndRunBotTurn = (state: GameState) => {
    if (botTimeoutId) {
      window.clearTimeout(botTimeoutId);
      botTimeoutId = null;
    }

    if (state.status !== 'playing') return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.type !== 'bot') return;

    // Check if bot can catch an opponent who forgot UNO
    if (state.unoCatchOpportunity) {
      const didCatch = checkBotCatchUno(currentPlayer, state, currentPlayer.difficulty);
      if (didCatch) {
        const catchResult = executeCatchUno(state, currentPlayer.id, state.unoCatchOpportunity.targetPlayerId);
        if (catchResult.success) {
          triggerAudio('uno');
          set({ game: catchResult.newState });
          state = catchResult.newState;
        }
      }
    }

    // Compute bot's move
    const decision = computeBotMove(currentPlayer, state, currentPlayer.difficulty);

    set({
      isBotThinking: true,
      botStatusText: decision.statusMessage || 'Thinking...',
    });

    botTimeoutId = window.setTimeout(() => {
      set({ isBotThinking: false, botStatusText: null });

      const currentState = get().game;
      if (!currentState || currentState.status !== 'playing') return;
      if (currentState.currentPlayerIndex !== state.currentPlayerIndex) return;

      if (decision.action === 'play' && decision.cardToPlay) {
        // If bot calls UNO before playing down to 1 card
        if (decision.shouldCallUnoBefore) {
          executeCallUno(currentState, currentPlayer.id);
          triggerAudio('uno');
        }

        const result = executePlayCard(currentState, currentPlayer.id, decision.cardToPlay.id, decision.chosenColor);
        if (result.success) {
          // Play appropriate SFX
          const cType = decision.cardToPlay.type;
          if (cType === 'draw2') triggerAudio('draw2');
          else if (cType === 'skip') triggerAudio('skip');
          else if (cType === 'reverse') triggerAudio('reverse');
          else if (cType === 'wild' || cType === 'wild4') triggerAudio('wild');
          else triggerAudio('play');

          if (result.newState.status === 'round_over') {
            triggerAudio('defeat'); // Bot won
            useStatsStore.getState().recordLoss();
          }

          set({ game: result.newState });
          checkAndRunBotTurn(result.newState);
        } else {
          // Fallback to draw if somehow failed
          const drawResult = executeDrawCard(currentState, currentPlayer.id);
          triggerAudio('draw');
          set({ game: drawResult.newState });
          checkAndRunBotTurn(drawResult.newState);
        }
      } else {
        // Bot draws
        const drawResult = executeDrawCard(currentState, currentPlayer.id);
        triggerAudio('draw');
        set({ game: drawResult.newState });
        checkAndRunBotTurn(drawResult.newState);
      }
    }, decision.delayMs);
  };

  return {
    game: null,
    selectedCardId: null,
    isBotThinking: false,
    botStatusText: null,
    pendingWildCardId: null,
    isDealing: false,

    startSoloGame: (botCount, difficulty, houseRules) => {
      if (botTimeoutId) window.clearTimeout(botTimeoutId);
      if (unoCatchTimeoutId) window.clearTimeout(unoCatchTimeoutId);

      const botNames = ['CyberBot', 'NovaBot', 'PixelBot', 'EchoBot'];
      const botAvatars = ['🤖', '👾', '🚀', '🔮'];

      const playerConfigs: Array<{
        name: string;
        avatar: string;
        isHuman: boolean;
        difficulty?: BotDifficulty;
      }> = [
        { name: 'You', avatar: '😎', isHuman: true },
      ];

      for (let i = 0; i < botCount; i++) {
        playerConfigs.push({
          name: botNames[i % botNames.length],
          avatar: botAvatars[i % botAvatars.length],
          isHuman: false,
          difficulty,
        });
      }

      const initialGameState = initializeGame({
        mode: 'solo',
        playerConfigs,
        houseRules,
      });

      set({
        game: initialGameState,
        selectedCardId: null,
        pendingWildCardId: null,
        isBotThinking: false,
        botStatusText: null,
        isDealing: true,
      });

      triggerAudio('play');

      // Deal animation delay
      setTimeout(() => {
        set({ isDealing: false });
        checkAndRunBotTurn(initialGameState);
      }, 1000);
    },

    startPassAndPlayGame: (playerCount, houseRules) => {
      if (botTimeoutId) window.clearTimeout(botTimeoutId);
      if (unoCatchTimeoutId) window.clearTimeout(unoCatchTimeoutId);

      const avatars = ['🦊', '🐼', '🦁', '🐯'];
      const playerConfigs = [];
      for (let i = 0; i < playerCount; i++) {
        playerConfigs.push({
          name: `Player ${i + 1}`,
          avatar: avatars[i],
          isHuman: true,
        });
      }

      const mode: GameMode = playerCount === 2
        ? 'pass-and-play-2'
        : playerCount === 3
          ? 'pass-and-play-3'
          : 'pass-and-play-4';

      const initialGameState = initializeGame({
        mode,
        playerConfigs,
        houseRules,
      });

      set({
        game: initialGameState,
        selectedCardId: null,
        pendingWildCardId: null,
        isBotThinking: false,
        botStatusText: null,
        isDealing: true,
      });

      triggerAudio('play');

      setTimeout(() => {
        set({ isDealing: false });
      }, 1000);
    },

    selectCard: (cardId) => {
      triggerAudio('select');
      set({ selectedCardId: cardId });
    },

    playSelectedCard: (chosenColor) => {
      const state = get().game;
      const cardId = get().selectedCardId || get().pendingWildCardId;
      if (!state || !cardId || state.status !== 'playing') return;

      const player = state.players[state.currentPlayerIndex];
      const card = player.hand.find(c => c.id === cardId);
      if (!card) return;

      // If wild and no color chosen, open picker
      if ((card.type === 'wild' || card.type === 'wild4') && !chosenColor) {
        set({ pendingWildCardId: cardId });
        return;
      }

      const result = executePlayCard(state, player.id, cardId, chosenColor);
      if (!result.success) {
        if (result.requiresColorChoice) {
          set({ pendingWildCardId: cardId });
        }
        return;
      }

      // Record stats
      if (player.isLocalUser) {
        useStatsStore.getState().recordCardPlayed(card.type === 'wild' || card.type === 'wild4', chosenColor || card.color);
      }

      // Audio feedback
      if (card.type === 'draw2') triggerAudio('draw2');
      else if (card.type === 'skip') triggerAudio('skip');
      else if (card.type === 'reverse') triggerAudio('reverse');
      else if (card.type === 'wild' || card.type === 'wild4') triggerAudio('wild');
      else triggerAudio('play');

      if (result.newState.status === 'round_over') {
        if (player.isLocalUser) {
          triggerAudio('victory');
          useStatsStore.getState().recordWin();
        } else {
          triggerAudio('defeat');
          useStatsStore.getState().recordLoss();
        }
      }

      set({
        game: result.newState,
        selectedCardId: null,
        pendingWildCardId: null,
      });

      checkAndRunBotTurn(result.newState);
    },

    humanDrawCard: () => {
      const state = get().game;
      if (!state || state.status !== 'playing') return;

      const player = state.players[state.currentPlayerIndex];
      const result = executeDrawCard(state, player.id);
      if (!result.success) return;

      triggerAudio('draw');

      set({
        game: result.newState,
        selectedCardId: null,
      });

      checkAndRunBotTurn(result.newState);
    },

    humanCallUno: () => {
      const state = get().game;
      if (!state || state.status !== 'playing') return;

      const player = state.players[state.currentPlayerIndex];
      const updated = executeCallUno(state, player.id);
      triggerAudio('uno');

      if (player.isLocalUser) {
        useStatsStore.getState().recordUnoCall();
      }

      set({ game: updated });
    },

    humanCatchUno: (targetId) => {
      const state = get().game;
      if (!state || !state.unoCatchOpportunity) return;

      const player = state.players.find(p => p.isLocalUser) || state.players[state.currentPlayerIndex];
      const result = executeCatchUno(state, player.id, targetId);
      if (result.success) {
        triggerAudio('uno');
        useStatsStore.getState().recordUnoCatch();
        set({ game: result.newState });
      }
    },

    confirmPassAndPlayTurn: () => {
      const state = get().game;
      if (!state) return;

      set({
        game: {
          ...state,
          passAndPlayPendingConfirmation: false,
        },
      });
    },

    restartGame: () => {
      const state = get().game;
      if (!state) return;

      if (state.mode === 'solo') {
        const botCount = state.players.filter(p => p.type === 'bot').length;
        const diff = state.players.find(p => p.type === 'bot')?.difficulty || 'medium';
        get().startSoloGame(botCount, diff, state.houseRules);
      } else {
        get().startPassAndPlayGame(state.players.length as 2 | 3 | 4, state.houseRules);
      }
    },

    exitToMenu: () => {
      if (botTimeoutId) window.clearTimeout(botTimeoutId);
      if (unoCatchTimeoutId) window.clearTimeout(unoCatchTimeoutId);
      set({ game: null, selectedCardId: null, pendingWildCardId: null });
    },
  };
});
