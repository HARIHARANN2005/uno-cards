import { Card, BaseCardColor } from './cards';

export type GameMode = 'solo' | 'pass-and-play-2' | 'pass-and-play-3' | 'pass-and-play-4' | 'online';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type PlayerType = 'human' | 'bot';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  type: PlayerType;
  difficulty?: BotDifficulty;
  hand: Card[];
  calledUno: boolean;
  score: number;
  isLocalUser: boolean;
  statusMessage?: string;
}

export type GameDirection = 1 | -1; // 1 = clockwise, -1 = counter-clockwise

export interface HouseRules {
  stackDrawCards: boolean;      // Stacking +2 on +2 or +4 on +4
  sevenZeroRule: boolean;       // 7 swaps hand, 0 rotates hands
  jumpIn: boolean;              // Exact duplicate can jump in out of turn
  forcePlayDrawn: boolean;      // Auto-play drawn card if legal
  drawToMatch: boolean;         // Keep drawing until playable (or draw 1)
  wildDraw4Challenge: boolean;  // Official challenge rule
}

export type GameStatus = 'idle' | 'dealing' | 'playing' | 'color_picker' | 'round_over' | 'game_over';

export interface UnoCatchOpportunity {
  targetPlayerId: string;
  expiresAt: number;
}

export interface LastAction {
  message: string;
  type: 'play' | 'draw' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4' | 'uno' | 'penalty' | 'challenge';
  timestamp: number;
}

export interface GameState {
  mode: GameMode;
  players: Player[];
  currentPlayerIndex: number;
  direction: GameDirection;
  drawPile: Card[];
  discardPile: Card[];
  activeColor: BaseCardColor;
  status: GameStatus;
  pendingDrawCount: number;
  winner: Player | null;
  unoCatchOpportunity: UnoCatchOpportunity | null;
  turnCount: number;
  roundNumber: number;
  houseRules: HouseRules;
  lastAction: LastAction | null;
  passAndPlayPendingConfirmation: boolean; // Protects hand during local pass-and-play turn switch
}

export interface MatchStats {
  gamesPlayed: number;
  gamesWon: number;
  winStreak: number;
  bestWinStreak: number;
  cardsPlayed: number;
  wildCardsPlayed: number;
  unoCallsSuccessful: number;
  unoCatchesSuccessful: number;
  colorCounts: {
    red: number;
    blue: number;
    green: number;
    yellow: number;
  };
}
