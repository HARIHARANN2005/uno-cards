import { Card, BaseCardColor } from '../../types/cards';
import { GameState, Player, BotDifficulty } from '../../types/game';
import { BASE_COLORS } from '../deck/deckFactory';
import { getPlayableCards, getNextPlayerIndex } from '../rules/standardRules';

export interface BotDecision {
  action: 'play' | 'draw' | 'call_uno';
  cardToPlay?: Card;
  chosenColor?: BaseCardColor;
  shouldCallUnoBefore?: boolean;
  statusMessage?: string;
  delayMs: number;
}

/**
 * Counts how many cards of each base color a player holds in their hand.
 */
export function getColorFrequencies(hand: Card[]): Record<BaseCardColor, number> {
  const counts: Record<BaseCardColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
  };

  for (const card of hand) {
    if (card.color !== 'wild') {
      counts[card.color as BaseCardColor]++;
    }
  }

  return counts;
}

/**
 * Selects the optimal color for a Wild card based on hand distribution.
 */
export function pickBestWildColor(hand: Card[]): BaseCardColor {
  const counts = getColorFrequencies(hand);
  let bestColor: BaseCardColor = 'red';
  let maxCount = -1;

  for (const color of BASE_COLORS) {
    if (counts[color] > maxCount) {
      maxCount = counts[color];
      bestColor = color;
    }
  }

  return bestColor;
}

/**
 * Evaluates the threat level of the next player based on their remaining card count.
 */
function getNextPlayerThreat(state: GameState): { threatLevel: 'critical' | 'high' | 'normal'; cardCount: number } {
  const nextIdx = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);
  const nextPlayer = state.players[nextIdx];
  const count = nextPlayer.hand.length;

  if (count === 1) return { threatLevel: 'critical', cardCount: count };
  if (count <= 2) return { threatLevel: 'high', cardCount: count };
  return { threatLevel: 'normal', cardCount: count };
}

/**
 * Computes bot's next move based on current game state and configured difficulty.
 */
export function computeBotMove(
  bot: Player,
  state: GameState,
  difficulty: BotDifficulty = 'medium'
): BotDecision {
  const topCard = state.discardPile[state.discardPile.length - 1];
  const playableCards = getPlayableCards(
    bot.hand,
    topCard,
    state.activeColor,
    state.houseRules,
    state.pendingDrawCount
  );

  // If no playable cards, bot must draw
  if (playableCards.length === 0) {
    return {
      action: 'draw',
      statusMessage: 'Drawing a card...',
      delayMs: difficulty === 'hard' ? 600 : difficulty === 'medium' ? 900 : 1200,
    };
  }

  // Will this move leave the bot with 1 card?
  const willHaveOneCard = bot.hand.length === 2;

  // Decide if bot should call UNO
  let shouldCallUno = false;
  if (willHaveOneCard) {
    if (difficulty === 'hard') {
      shouldCallUno = true; // Hard bots always remember
    } else if (difficulty === 'medium') {
      shouldCallUno = Math.random() > 0.15; // 85% chance
    } else {
      shouldCallUno = Math.random() > 0.40; // 60% chance
    }
  }

  let selectedCard: Card;

  if (difficulty === 'easy') {
    // Easy: randomly choose any legal card
    selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)];
  } else if (difficulty === 'medium') {
    // Medium:
    // 1. If next player is low on cards, prioritize action cards (+2, Skip, Reverse)
    const { threatLevel } = getNextPlayerThreat(state);
    const actionCards = playableCards.filter(c => c.type === 'draw2' || c.type === 'skip' || c.type === 'reverse');
    const colorCards = playableCards.filter(c => c.color !== 'wild');
    const counts = getColorFrequencies(bot.hand);

    if (threatLevel !== 'normal' && actionCards.length > 0) {
      selectedCard = actionCards[0];
    } else if (colorCards.length > 0) {
      // Pick card whose color bot has the most of
      colorCards.sort((a, b) => {
        const countA = a.color !== 'wild' ? counts[a.color as BaseCardColor] : 0;
        const countB = b.color !== 'wild' ? counts[b.color as BaseCardColor] : 0;
        return countB - countA;
      });
      selectedCard = colorCards[0];
    } else {
      selectedCard = playableCards[0];
    }
  } else {
    // Hard:
    // Detailed strategic score for each card
    const { threatLevel } = getNextPlayerThreat(state);
    const counts = getColorFrequencies(bot.hand);

    const scoredMoves = playableCards.map(card => {
      let score = 0;

      // Threat mitigation
      if (threatLevel === 'critical') {
        if (card.type === 'wild4') score += 100;
        if (card.type === 'draw2') score += 90;
        if (card.type === 'skip') score += 80;
        if (card.type === 'reverse') score += 75;
      } else if (threatLevel === 'high') {
        if (card.type === 'draw2') score += 50;
        if (card.type === 'skip') score += 45;
        if (card.type === 'reverse') score += 40;
        if (card.type === 'wild4') score += 30; // Save Wild 4 for critical if possible
      }

      // Color synergy: playing cards of majority color
      if (card.color !== 'wild') {
        const freq = counts[card.color as BaseCardColor];
        score += freq * 10;
        // High point value cards (like 9, 8, action cards) should be shed earlier to avoid losing points
        score += card.scoreValue * 0.5;
      } else {
        // Wild cards: save them unless we have no good colored plays or game is close to end
        if (bot.hand.length <= 3) {
          score += 35;
        } else {
          score -= 15; // Prefer saving wild
        }
      }

      return { card, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    selectedCard = scoredMoves[0].card;
  }

  // If card is wild, pick best color
  let chosenColor: BaseCardColor | undefined;
  if (selectedCard.type === 'wild' || selectedCard.type === 'wild4') {
    chosenColor = pickBestWildColor(bot.hand.filter(c => c.id !== selectedCard.id));
  }

  const thinkingTime = difficulty === 'hard'
    ? 600 + Math.random() * 400
    : difficulty === 'medium'
      ? 800 + Math.random() * 600
      : 1000 + Math.random() * 800;

  return {
    action: 'play',
    cardToPlay: selectedCard,
    chosenColor,
    shouldCallUnoBefore: shouldCallUno,
    statusMessage: selectedCard.type === 'wild' || selectedCard.type === 'wild4' ? 'Choosing color...' : 'Playing card...',
    delayMs: Math.round(thinkingTime),
  };
}

/**
 * Checks if a bot notices and catches an opponent who forgot to call UNO.
 */
export function checkBotCatchUno(
  bot: Player,
  state: GameState,
  difficulty: BotDifficulty = 'medium'
): boolean {
  if (!state.unoCatchOpportunity) return false;
  if (state.unoCatchOpportunity.targetPlayerId === bot.id) return false;

  const catchChance = difficulty === 'hard' ? 0.90 : difficulty === 'medium' ? 0.65 : 0.25;
  return Math.random() < catchChance;
}
