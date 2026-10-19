import { Card, BaseCardColor } from '../../types/cards';
import { GameState, Player, HouseRules, GameMode, BotDifficulty, LastAction } from '../../types/game';
import { createStandardDeck, shuffleDeck, pickValidStarterCard } from '../deck/deckFactory';
import { isCardPlayable, getNextPlayerIndex, calculateRoundScore } from '../rules/standardRules';

export const DEFAULT_HOUSE_RULES: HouseRules = {
  stackDrawCards: false,
  sevenZeroRule: false,
  jumpIn: false,
  forcePlayDrawn: false,
  drawToMatch: false,
  wildDraw4Challenge: false,
};

export interface GameInitOptions {
  mode: GameMode;
  playerConfigs: Array<{
    name: string;
    avatar: string;
    isHuman: boolean;
    difficulty?: BotDifficulty;
  }>;
  houseRules?: Partial<HouseRules>;
  rng?: () => number;
}

/**
 * Initializes a new game round.
 */
export function initializeGame(options: GameInitOptions): GameState {
  const rules: HouseRules = { ...DEFAULT_HOUSE_RULES, ...options.houseRules };
  const rawDeck = createStandardDeck();
  const deck = shuffleDeck(rawDeck, options.rng);

  const players: Player[] = options.playerConfigs.map((cfg, index) => ({
    id: `p-${index}-${Math.random().toString(36).substring(2, 6)}`,
    name: cfg.name,
    avatar: cfg.avatar,
    type: cfg.isHuman ? 'human' : 'bot',
    difficulty: cfg.difficulty || 'medium',
    hand: [],
    calledUno: false,
    score: 0,
    isLocalUser: cfg.isHuman && index === 0,
    statusMessage: undefined,
  }));

  // Deal 7 cards to each player
  let remainingDeck = [...deck];
  for (let i = 0; i < 7; i++) {
    for (const player of players) {
      if (remainingDeck.length > 0) {
        player.hand.push(remainingDeck.shift()!);
      }
    }
  }

  // Find a valid starter card (number card)
  const { starter, remainingDeck: deckAfterStarter } = pickValidStarterCard(remainingDeck);
  remainingDeck = deckAfterStarter;

  const discardPile = [starter];
  const activeColor = starter.color as BaseCardColor;

  return {
    mode: options.mode,
    players,
    currentPlayerIndex: 0,
    direction: 1,
    drawPile: remainingDeck,
    discardPile,
    activeColor,
    status: 'playing',
    pendingDrawCount: 0,
    winner: null,
    unoCatchOpportunity: null,
    turnCount: 0,
    roundNumber: 1,
    houseRules: rules,
    lastAction: {
      message: `Game started! Top card is ${starter.color} ${starter.value}.`,
      type: 'play',
      timestamp: Date.now(),
    },
    passAndPlayPendingConfirmation: false,
  };
}

/**
 * Draws cards from deck, reshuffling discard pile if deck runs low.
 */
export function drawCardsFromPile(
  drawPile: Card[],
  discardPile: Card[],
  count: number,
  rng: () => number = Math.random
): { drawn: Card[]; newDrawPile: Card[]; newDiscardPile: Card[] } {
  let currentDraw = [...drawPile];
  let currentDiscard = [...discardPile];
  const drawn: Card[] = [];

  for (let i = 0; i < count; i++) {
    if (currentDraw.length === 0) {
      if (currentDiscard.length <= 1) {
        // Nothing more to reshuffle
        break;
      }
      // Keep top card on discard pile, shuffle the rest into draw pile
      const topCard = currentDiscard.pop()!;
      currentDraw = shuffleDeck(currentDiscard, rng);
      currentDiscard = [topCard];
    }

    if (currentDraw.length > 0) {
      drawn.push(currentDraw.shift()!);
    }
  }

  return { drawn, newDrawPile: currentDraw, newDiscardPile: currentDiscard };
}

export interface PlayCardResult {
  success: boolean;
  newState: GameState;
  error?: string;
  requiresColorChoice?: boolean;
}

/**
 * Plays a card for a player.
 */
export function executePlayCard(
  state: GameState,
  playerId: string,
  cardId: string,
  chosenColor?: BaseCardColor,
  rng: () => number = Math.random
): PlayCardResult {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, newState: state, error: 'Player not found' };
  }

  if (playerIndex !== state.currentPlayerIndex) {
    // Check if jump-in rule is active and matches exact card
    if (state.houseRules.jumpIn) {
      const topCard = state.discardPile[state.discardPile.length - 1];
      const card = state.players[playerIndex].hand.find(c => c.id === cardId);
      if (!card || card.color !== topCard.color || card.value !== topCard.value) {
        return { success: false, newState: state, error: 'Not your turn' };
      }
    } else {
      return { success: false, newState: state, error: 'Not your turn' };
    }
  }

  const player = state.players[playerIndex];
  const cardIndex = player.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    return { success: false, newState: state, error: 'Card not in hand' };
  }

  const card = player.hand[cardIndex];
  const topCard = state.discardPile[state.discardPile.length - 1];

  // Validate legality
  if (!isCardPlayable(card, topCard, state.activeColor, player.hand, state.houseRules, state.pendingDrawCount)) {
    return { success: false, newState: state, error: 'Illegal move' };
  }

  // Check if Wild card needs color choice
  const isWildCard = card.type === 'wild' || card.type === 'wild4';
  if (isWildCard && !chosenColor) {
    return {
      success: false,
      newState: {
        ...state,
        status: 'color_picker',
      },
      requiresColorChoice: true,
    };
  }

  // Clone state
  const newPlayers = state.players.map((p, idx) => {
    if (idx !== playerIndex) return { ...p };
    const newHand = p.hand.filter(c => c.id !== cardId);
    return { ...p, hand: newHand };
  });

  const playedCard: Card = {
    ...card,
    assignedColor: isWildCard ? chosenColor : undefined,
  };

  const newDiscardPile = [...state.discardPile, playedCard];
  const newActiveColor = (isWildCard ? chosenColor : card.color) as BaseCardColor;

  const updatedPlayer = newPlayers[playerIndex];
  let newUnoCatch: GameState['unoCatchOpportunity'] = state.unoCatchOpportunity;

  // Check UNO condition:
  if (updatedPlayer.hand.length === 1) {
    if (!updatedPlayer.calledUno) {
      // Opportunity to catch for 4 seconds
      newUnoCatch = {
        targetPlayerId: updatedPlayer.id,
        expiresAt: Date.now() + 4000,
      };
    }
  } else if (updatedPlayer.hand.length > 1) {
    updatedPlayer.calledUno = false;
  }

  // Check Win Condition
  if (updatedPlayer.hand.length === 0) {
    const losingHands = newPlayers.filter((_, idx) => idx !== playerIndex).map(p => p.hand);
    const roundScore = calculateRoundScore(losingHands);
    updatedPlayer.score += roundScore;

    const actionText = `${updatedPlayer.name} played ${playedCard.color} ${playedCard.value} and WON the round! (+${roundScore} pts)`;
    return {
      success: true,
      newState: {
        ...state,
        players: newPlayers,
        discardPile: newDiscardPile,
        activeColor: newActiveColor,
        status: 'round_over',
        winner: updatedPlayer,
        unoCatchOpportunity: null,
        pendingDrawCount: 0,
        lastAction: {
          message: actionText,
          type: 'play',
          timestamp: Date.now(),
        },
      },
    };
  }

  // Calculate next turn progression and card effects
  let nextIndex = state.currentPlayerIndex;
  let nextDirection = state.direction;
  let newDrawPile = [...state.drawPile];
  let newPendingDraw = state.pendingDrawCount;
  let lastActionType: LastAction['type'] = 'play';
  let actionMessage = `${updatedPlayer.name} played ${playedCard.color === 'wild' ? 'Wild' : playedCard.color} ${playedCard.value}.`;

  const totalPlayers = newPlayers.length;

  if (card.type === 'reverse') {
    lastActionType = 'reverse';
    if (totalPlayers === 2) {
      // 2 players: reverse acts as a skip!
      actionMessage = `${updatedPlayer.name} played Reverse (acting as Skip in 2-player mode).`;
      nextIndex = playerIndex; // Current player gets another turn
    } else {
      nextDirection = (nextDirection * -1) as 1 | -1;
      actionMessage = `${updatedPlayer.name} reversed direction!`;
      nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 1);
    }
  } else if (card.type === 'skip') {
    lastActionType = 'skip';
    const skippedPlayerIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 1);
    actionMessage = `${updatedPlayer.name} skipped ${newPlayers[skippedPlayerIndex].name}!`;
    nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 2);
  } else if (card.type === 'draw2') {
    lastActionType = 'draw2';
    if (state.houseRules.stackDrawCards) {
      newPendingDraw += 2;
      actionMessage = `${updatedPlayer.name} stacked a +2! (Total +${newPendingDraw})`;
      nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 1);
    } else {
      // Standard rule: next player draws 2 and loses their turn
      const victimIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 1);
      const { drawn, newDrawPile: remainingDraw } = drawCardsFromPile(
        newDrawPile,
        newDiscardPile,
        2,
        rng
      );
      newDrawPile = remainingDraw;
      newPlayers[victimIndex].hand.push(...drawn);
      actionMessage = `${updatedPlayer.name} played Draw 2! ${newPlayers[victimIndex].name} drew 2 cards and was skipped.`;
      nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 2);
    }
  } else if (card.type === 'wild4') {
    lastActionType = 'wild4';
    if (state.houseRules.stackDrawCards) {
      newPendingDraw += 4;
      actionMessage = `${updatedPlayer.name} played Wild +4 (Color: ${chosenColor})! (Total +${newPendingDraw})`;
      nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 1);
    } else {
      // Standard: next player draws 4 and loses turn
      const victimIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 1);
      const { drawn, newDrawPile: remainingDraw } = drawCardsFromPile(
        newDrawPile,
        newDiscardPile,
        4,
        rng
      );
      newDrawPile = remainingDraw;
      newPlayers[victimIndex].hand.push(...drawn);
      actionMessage = `${updatedPlayer.name} played Wild Draw 4 (Color: ${chosenColor})! ${newPlayers[victimIndex].name} drew 4 cards and was skipped.`;
      nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 2);
    }
  } else {
    // Normal number card or standard Wild
    if (card.type === 'wild') {
      lastActionType = 'wild';
      actionMessage = `${updatedPlayer.name} played Wild and chose ${chosenColor}!`;
    }

    // Seven-0 rule checks if enabled
    if (state.houseRules.sevenZeroRule && card.value === '0') {
      // Rotate all hands in current direction
      const hands = newPlayers.map(p => p.hand);
      for (let i = 0; i < totalPlayers; i++) {
        const fromIndex = (i - nextDirection + totalPlayers) % totalPlayers;
        newPlayers[i].hand = hands[fromIndex];
      }
      actionMessage += ` Hand rotation on 0!`;
    }

    nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, nextDirection, 1);
  }

  // Pass-and-play screen privacy barrier for local human matches
  const isPassAndPlay = state.mode.startsWith('pass-and-play');
  const isNextPlayerHuman = newPlayers[nextIndex].type === 'human';
  const shouldRequireConfirmation = isPassAndPlay && isNextPlayerHuman && nextIndex !== playerIndex;

  return {
    success: true,
    newState: {
      ...state,
      players: newPlayers,
      currentPlayerIndex: nextIndex,
      direction: nextDirection,
      drawPile: newDrawPile,
      discardPile: newDiscardPile,
      activeColor: newActiveColor,
      status: 'playing',
      pendingDrawCount: newPendingDraw,
      unoCatchOpportunity: newUnoCatch,
      turnCount: state.turnCount + 1,
      lastAction: {
        message: actionMessage,
        type: lastActionType,
        timestamp: Date.now(),
      },
      passAndPlayPendingConfirmation: shouldRequireConfirmation,
    },
  };
}

/**
 * Executes a card draw for the active player.
 */
export function executeDrawCard(
  state: GameState,
  playerId: string,
  rng: () => number = Math.random
): { success: boolean; newState: GameState; drawnCards: Card[]; error?: string } {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) {
    return { success: false, newState: state, drawnCards: [], error: 'Not your turn' };
  }

  const player = state.players[playerIndex];
  const countToDraw = state.pendingDrawCount > 0 ? state.pendingDrawCount : 1;

  const { drawn, newDrawPile, newDiscardPile } = drawCardsFromPile(
    state.drawPile,
    state.discardPile,
    countToDraw,
    rng
  );

  const newPlayers = state.players.map((p, idx) => {
    if (idx !== playerIndex) return { ...p };
    return {
      ...p,
      hand: [...p.hand, ...drawn],
      calledUno: false, // drawing cards invalidates UNO if hand > 1
    };
  });

  const wasStackedDraw = state.pendingDrawCount > 0;
  const totalPlayers = newPlayers.length;
  const nextIndex = getNextPlayerIndex(playerIndex, totalPlayers, state.direction, 1);

  const isPassAndPlay = state.mode.startsWith('pass-and-play');
  const isNextPlayerHuman = newPlayers[nextIndex].type === 'human';

  const actionMsg = wasStackedDraw
    ? `${player.name} drew ${countToDraw} penalty cards and forfeited turn.`
    : `${player.name} drew a card.`;

  return {
    success: true,
    drawnCards: drawn,
    newState: {
      ...state,
      players: newPlayers,
      currentPlayerIndex: nextIndex,
      drawPile: newDrawPile,
      discardPile: newDiscardPile,
      pendingDrawCount: 0,
      turnCount: state.turnCount + 1,
      lastAction: {
        message: actionMsg,
        type: 'draw',
        timestamp: Date.now(),
      },
      passAndPlayPendingConfirmation: isPassAndPlay && isNextPlayerHuman,
    },
  };
}

/**
 * Handles a player calling UNO.
 */
export function executeCallUno(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const newPlayers = state.players.map(p => {
    if (p.id === playerId) {
      return { ...p, calledUno: true };
    }
    return p;
  });

  const clearCatch = state.unoCatchOpportunity?.targetPlayerId === playerId ? null : state.unoCatchOpportunity;

  return {
    ...state,
    players: newPlayers,
    unoCatchOpportunity: clearCatch,
    lastAction: {
      message: `${player.name} shouted UNO! 🚨`,
      type: 'uno',
      timestamp: Date.now(),
    },
  };
}

/**
 * Challenges / catches an opponent who failed to call UNO with 1 card remaining.
 */
export function executeCatchUno(
  state: GameState,
  catcherId: string,
  targetId: string,
  rng: () => number = Math.random
): { success: boolean; newState: GameState; penaltyCards: number } {
  const catcher = state.players.find(p => p.id === catcherId);
  const target = state.players.find(p => p.id === targetId);

  if (!catcher || !target || target.hand.length !== 1 || target.calledUno) {
    return { success: false, newState: state, penaltyCards: 0 };
  }

  // Target draws 2 penalty cards
  const { drawn, newDrawPile, newDiscardPile } = drawCardsFromPile(
    state.drawPile,
    state.discardPile,
    2,
    rng
  );

  const newPlayers = state.players.map(p => {
    if (p.id === targetId) {
      return { ...p, hand: [...p.hand, ...drawn], calledUno: false };
    }
    return p;
  });

  return {
    success: true,
    penaltyCards: 2,
    newState: {
      ...state,
      players: newPlayers,
      drawPile: newDrawPile,
      discardPile: newDiscardPile,
      unoCatchOpportunity: null,
      lastAction: {
        message: `${catcher.name} caught ${target.name} forgetting to call UNO! (+2 penalty cards)`,
        type: 'penalty',
        timestamp: Date.now(),
      },
    },
  };
}
