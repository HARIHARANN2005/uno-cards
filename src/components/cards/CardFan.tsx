import React from 'react';
import { Card as CardModel, BaseCardColor } from '../../types/cards';
import { Card } from './Card';
import { isCardPlayable } from '../../game/rules/standardRules';
import { HouseRules } from '../../types/game';

interface CardFanProps {
  cards: CardModel[];
  topCard: CardModel;
  activeColor: BaseCardColor;
  houseRules: HouseRules;
  pendingDrawCount: number;
  isCurrentPlayerTurn: boolean;
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onPlayCard: (card: CardModel) => void;
  disabled?: boolean;
}

export const CardFan: React.FC<CardFanProps> = ({
  cards,
  topCard,
  activeColor,
  houseRules,
  pendingDrawCount,
  isCurrentPlayerTurn,
  selectedCardId,
  onSelectCard,
  onPlayCard,
  disabled = false,
}) => {
  const total = cards.length;

  // Calculate arc angles and overlap spacing
  const getCardLayout = (index: number) => {
    if (total === 1) return { rotate: 0, xOffset: 0, yOffset: 0 };

    const maxArcAngle = Math.min(28, total * 3.5);
    const angleStep = maxArcAngle / (total - 1);
    const rotate = -maxArcAngle / 2 + index * angleStep;

    // Slight parabolic arc
    const normalized = (index - (total - 1) / 2) / ((total - 1) / 2 || 1);
    const yOffset = Math.abs(normalized) * (total > 6 ? 12 : 6);

    // Overlap offset
    const spacing = total > 10 ? -28 : total > 7 ? -20 : total > 4 ? -12 : 0;
    const xOffset = index * spacing;

    return { rotate, xOffset, yOffset };
  };

  return (
    <div className="relative w-full flex items-center justify-center py-4 px-2 overflow-x-auto no-scrollbar min-h-[160px] sm:min-h-[200px]">
      <div className="flex items-end justify-center relative pb-3">
        {cards.map((card, index) => {
          const playable = isCurrentPlayerTurn && !disabled && isCardPlayable(
            card,
            topCard,
            activeColor,
            cards,
            houseRules,
            pendingDrawCount
          );

          const isSelected = card.id === selectedCardId;
          const { rotate, yOffset } = getCardLayout(index);

          return (
            <div
              key={card.id}
              style={{
                zIndex: isSelected ? 40 : index + 10,
                transform: `translateY(${yOffset}px)`,
                marginLeft: index === 0 ? 0 : total > 12 ? '-2.8rem' : total > 8 ? '-2.2rem' : total > 5 ? '-1.5rem' : '-0.8rem',
              }}
              className="transition-all duration-150"
            >
              <Card
                card={card}
                isPlayable={playable}
                isSelected={isSelected}
                rotation={rotate}
                size="md"
                disabled={disabled}
                onClick={() => {
                  if (isSelected && playable) {
                    onPlayCard(card);
                  } else {
                    onSelectCard(card.id);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
