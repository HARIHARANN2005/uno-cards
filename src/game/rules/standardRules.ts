import { Card, BaseCardColor } from '../../types/cards';
import { HouseRules } from '../../types/game';

/**
 * Checks if a player has any cards matching the active color.
 * Used for Wild Draw 4 legality check under official rules.
 */
export function hasMatchingColorCard(hand: Card[], activeColor: BaseCardColor): boolean {
  return hand.some(c => c.color === activeColor);
}

/**
 * Determines whether a specific card is playable given the top card, active color,
 * the player's full hand, and current house rules / pending draws.
 */
export function isCardPlayable(
  card: Card,
  topCard: Card,
  activeColor: BaseCardColor,
  playerHand: Card[],
  houseRules: HouseRules,
  pendingDrawCount = 0
): boolean {
  // If there's an active stacked penalty (+2 or +4)
  if (pendingDrawCount > 0) {
    if (!houseRules.stackDrawCards) {
      return false; // Stacking disabled: must draw the penalty cards
    }

    // Stacking enabled:
    if (topCard.type === 'draw2' && card.type === 'draw2') {
      return true;
    }
    if (topCard.type === 'wild4' && card.type === 'wild4') {
      return true;
    }
    return false;
  }

  // Wild is always playable
  if (card.type === 'wild') {
    return true;
  }

  // Wild Draw 4
  if (card.type === 'wild4') {
    // If strict challenge rule is enabled, Wild Draw 4 is only legal if no card in hand matches activeColor
    if (houseRules.wildDraw4Challenge) {
      return !hasMatchingColorCard(playerHand, activeColor);
    }
    return true;
  }

  // Matching color
  if (card.color === activeColor) {
    return true;
  }

  // Matching symbol / number value
  if (card.value === topCard.value) {
    return true;
  }

  return false;
}

/**
 * Returns all playable cards in a player's hand.
 */
export function getPlayableCards(
  hand: Card[],
  topCard: Card,
  activeColor: BaseCardColor,
  houseRules: HouseRules,
  pendingDrawCount = 0
): Card[] {
  return hand.filter(card =>
    isCardPlayable(card, topCard, activeColor, hand, houseRules, pendingDrawCount)
  );
}

/**
 * Computes next player index considering game direction, skip steps, and 2-player special rules.
 */
export function getNextPlayerIndex(
  currentIndex: number,
  playerCount: number,
  direction: 1 | -1,
  steps = 1
): number {
  const raw = currentIndex + (direction * steps);
  return ((raw % playerCount) + playerCount) % playerCount;
}

/**
 * Calculates the score of remaining cards in other players' hands when someone wins.
 */
export function calculateRoundScore(losingHands: Card[][]): number {
  return losingHands.reduce((total, hand) => {
    return total + hand.reduce((handSum, card) => handSum + card.scoreValue, 0);
  }, 0);
}
