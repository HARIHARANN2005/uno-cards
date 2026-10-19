import { Card, BaseCardColor, CardValue } from '../../types/cards';

export const BASE_COLORS: BaseCardColor[] = ['red', 'blue', 'green', 'yellow'];

let idCounter = 1;
export function generateCardId(prefix = 'c'): string {
  return `${prefix}-${idCounter++}-${Math.random().toString(36).substring(2, 7)}`;
}

export function resetCardIdCounter(): void {
  idCounter = 1;
}

/**
 * Creates a standard 108-card UNO-style deck.
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];

  // For each of the 4 colors:
  for (const color of BASE_COLORS) {
    // 1 Zero card (score: 0)
    deck.push({
      id: generateCardId('zero'),
      color,
      type: 'number',
      value: '0',
      scoreValue: 0,
    });

    // 2 each of 1-9 (score: face value)
    for (let num = 1; num <= 9; num++) {
      const val = num.toString() as CardValue;
      for (let copy = 1; copy <= 2; copy++) {
        deck.push({
          id: generateCardId(`${color}-${num}-${copy}`),
          color,
          type: 'number',
          value: val,
          scoreValue: num,
        });
      }
    }

    // 2 Skip cards (score: 20)
    for (let copy = 1; copy <= 2; copy++) {
      deck.push({
        id: generateCardId(`${color}-skip-${copy}`),
        color,
        type: 'skip',
        value: 'skip',
        scoreValue: 20,
      });
    }

    // 2 Reverse cards (score: 20)
    for (let copy = 1; copy <= 2; copy++) {
      deck.push({
        id: generateCardId(`${color}-rev-${copy}`),
        color,
        type: 'reverse',
        value: 'reverse',
        scoreValue: 20,
      });
    }

    // 2 Draw Two cards (score: 20)
    for (let copy = 1; copy <= 2; copy++) {
      deck.push({
        id: generateCardId(`${color}-d2-${copy}`),
        color,
        type: 'draw2',
        value: 'draw2',
        scoreValue: 20,
      });
    }
  }

  // 4 Wild cards (score: 50)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: generateCardId(`wild-${i}`),
      color: 'wild',
      type: 'wild',
      value: 'wild',
      scoreValue: 50,
    });
  }

  // 4 Wild Draw Four cards (score: 50)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: generateCardId(`w4-${i}`),
      color: 'wild',
      type: 'wild4',
      value: 'wild4',
      scoreValue: 50,
    });
  }

  return deck;
}

/**
 * Shuffles an array of cards using Fisher-Yates algorithm.
 * An optional pseudo-random generator function can be provided for deterministic tests.
 */
export function shuffleDeck(cards: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Ensures the first discard card is valid (standard rule: must be a number card, not wild or wild draw 4).
 */
export function pickValidStarterCard(deck: Card[]): { starter: Card; remainingDeck: Card[] } {
  const cards = [...deck];
  const validIndex = cards.findIndex(c => c.type === 'number');

  if (validIndex === -1) {
    // Fallback if somehow no number card found
    const starter = cards.shift()!;
    return { starter, remainingDeck: cards };
  }

  const [starter] = cards.splice(validIndex, 1);
  return { starter, remainingDeck: cards };
}
