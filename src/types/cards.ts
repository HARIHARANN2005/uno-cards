export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type BaseCardColor = 'red' | 'blue' | 'green' | 'yellow';

export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export type CardValue =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value: CardValue;
  scoreValue: number;
  /** When a wild card is placed on discard pile, chosen color is stored here */
  assignedColor?: BaseCardColor;
}

export type Deck = Card[];

export interface CardDimensions {
  width: number;
  height: number;
}
