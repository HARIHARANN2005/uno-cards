import { describe, it, expect } from 'vitest';
import { createStandardDeck, pickValidStarterCard } from '../game/deck/deckFactory';
import { isCardPlayable, getNextPlayerIndex } from '../game/rules/standardRules';
import {
  initializeGame,
  executePlayCard,
  executeCatchUno,
  drawCardsFromPile,
  DEFAULT_HOUSE_RULES,
} from '../game/engine/gameEngine';
import { Card } from '../types/cards';

describe('Deck Factory', () => {
  it('generates an exact 108-card standard UNO deck', () => {
    const deck = createStandardDeck();
    expect(deck.length).toBe(108);

    const redCards = deck.filter(c => c.color === 'red');
    const blueCards = deck.filter(c => c.color === 'blue');
    const greenCards = deck.filter(c => c.color === 'green');
    const yellowCards = deck.filter(c => c.color === 'yellow');
    const wildCards = deck.filter(c => c.color === 'wild');

    // 25 cards per base color: 1 zero + 18 numbers (1-9 x 2) + 2 skip + 2 reverse + 2 draw2 = 25
    expect(redCards.length).toBe(25);
    expect(blueCards.length).toBe(25);
    expect(greenCards.length).toBe(25);
    expect(yellowCards.length).toBe(25);

    // 4 Wild + 4 Wild Draw Four = 8
    expect(wildCards.length).toBe(8);
    expect(wildCards.filter(c => c.type === 'wild').length).toBe(4);
    expect(wildCards.filter(c => c.type === 'wild4').length).toBe(4);
  });

  it('selects a valid number card as starter discard card', () => {
    const deck = createStandardDeck();
    const { starter, remainingDeck } = pickValidStarterCard(deck);

    expect(starter.type).toBe('number');
    expect(starter.color).not.toBe('wild');
    expect(remainingDeck.length).toBe(107);
  });
});

describe('Rules Engine', () => {
  const topCard: Card = { id: 'top-1', color: 'blue', type: 'number', value: '5', scoreValue: 5 };

  it('allows playing a card matching color', () => {
    const matchingColor: Card = { id: 'c-1', color: 'blue', type: 'number', value: '8', scoreValue: 8 };
    expect(isCardPlayable(matchingColor, topCard, 'blue', [matchingColor], DEFAULT_HOUSE_RULES)).toBe(true);
  });

  it('allows playing a card matching number on different color', () => {
    const matchingNumber: Card = { id: 'c-2', color: 'red', type: 'number', value: '5', scoreValue: 5 };
    expect(isCardPlayable(matchingNumber, topCard, 'blue', [matchingNumber], DEFAULT_HOUSE_RULES)).toBe(true);
  });

  it('rejects cards matching neither color nor number', () => {
    const mismatch: Card = { id: 'c-3', color: 'green', type: 'number', value: '2', scoreValue: 2 };
    expect(isCardPlayable(mismatch, topCard, 'blue', [mismatch], DEFAULT_HOUSE_RULES)).toBe(false);
  });

  it('always allows standard Wild cards', () => {
    const wildCard: Card = { id: 'w-1', color: 'wild', type: 'wild', value: 'wild', scoreValue: 50 };
    expect(isCardPlayable(wildCard, topCard, 'blue', [wildCard], DEFAULT_HOUSE_RULES)).toBe(true);
  });

  it('handles reverse in 2-player games as a skip', () => {
    // In 2 players, playing a reverse should keep turn with current player (effectively skipping opponent)
    const nextIndex = getNextPlayerIndex(0, 2, 1, 2);
    expect(nextIndex).toBe(0);
  });
});

describe('Game Engine State Transitions', () => {
  it('initializes game with 7 cards per player and valid starter discard', () => {
    const state = initializeGame({
      mode: 'solo',
      playerConfigs: [
        { name: 'Player 1', avatar: '😎', isHuman: true },
        { name: 'Bot 1', avatar: '🤖', isHuman: false },
        { name: 'Bot 2', avatar: '👾', isHuman: false },
        { name: 'Bot 3', avatar: '🚀', isHuman: false },
      ],
    });

    expect(state.players.length).toBe(4);
    for (const player of state.players) {
      expect(player.hand.length).toBe(7);
    }
    expect(state.discardPile.length).toBe(1);
    expect(state.discardPile[0].type).toBe('number');
    expect(state.status).toBe('playing');
  });

  it('reshuffles discard pile when draw deck runs out', () => {
    const drawPile: Card[] = [];
    const discardPile: Card[] = [
      { id: 'd-1', color: 'red', type: 'number', value: '1', scoreValue: 1 },
      { id: 'd-2', color: 'blue', type: 'number', value: '2', scoreValue: 2 },
      { id: 'd-3', color: 'green', type: 'number', value: '3', scoreValue: 3 },
      { id: 'top', color: 'yellow', type: 'number', value: '9', scoreValue: 9 },
    ];

    const { drawn, newDiscardPile } = drawCardsFromPile(drawPile, discardPile, 2);

    expect(drawn.length).toBe(2);
    expect(newDiscardPile.length).toBe(1);
    expect(newDiscardPile[0].id).toBe('top'); // Top card preserved
  });

  it('correctly manages UNO calls and catching forgotten calls', () => {
    let state = initializeGame({
      mode: 'solo',
      playerConfigs: [
        { name: 'Player 1', avatar: '😎', isHuman: true },
        { name: 'Bot 1', avatar: '🤖', isHuman: false },
      ],
    });

    // Reduce Player 1 hand to 1 card without calling UNO
    state.players[0].hand = [{ id: 'last-1', color: 'red', type: 'number', value: '3', scoreValue: 3 }];
    state.players[0].calledUno = false;

    // Bot 1 catches Player 1
    const catchResult = executeCatchUno(state, state.players[1].id, state.players[0].id);
    expect(catchResult.success).toBe(true);
    expect(catchResult.penaltyCards).toBe(2);
    // Player 1 should now have 3 cards (1 + 2 penalties)
    expect(catchResult.newState.players[0].hand.length).toBe(3);
  });

  it('calculates round scores and declares winner when hand is empty', () => {
    let state = initializeGame({
      mode: 'solo',
      playerConfigs: [
        { name: 'Player 1', avatar: '😎', isHuman: true },
        { name: 'Bot 1', avatar: '🤖', isHuman: false },
      ],
    });

    // Top card is red 5
    state.discardPile = [{ id: 'top-r5', color: 'red', type: 'number', value: '5', scoreValue: 5 }];
    state.activeColor = 'red';
    state.currentPlayerIndex = 0;

    // Player 1 has winning card (red 9)
    state.players[0].hand = [{ id: 'win-card', color: 'red', type: 'number', value: '9', scoreValue: 9 }];
    // Bot 1 has two cards: blue 3 (3 pts) + wild (50 pts) = 53 pts
    state.players[1].hand = [
      { id: 'b-3', color: 'blue', type: 'number', value: '3', scoreValue: 3 },
      { id: 'w-card', color: 'wild', type: 'wild', value: 'wild', scoreValue: 50 },
    ];

    const result = executePlayCard(state, state.players[0].id, 'win-card');
    expect(result.success).toBe(true);
    expect(result.newState.status).toBe('round_over');
    expect(result.newState.winner?.id).toBe(state.players[0].id);
    expect(result.newState.winner?.score).toBe(53);
  });
});
