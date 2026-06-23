import React, { useState, useEffect, useCallback, useRef } from 'react';
import MemoryCard from './MemoryCard';
import { shuffleArray } from '../lib/utils';
import { useAnnouncer } from '@react-aria/live-announcer';

interface Card {
  id: number;
  value: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onGameComplete: (matches: number) => void;
}

const cardImages = [
  { value: 'Mickey', image: '/assets/characters/mickey.png' },
  { value: 'Minnie', image: '/assets/characters/minnie.png' },
  { value: 'Donald', image: '/assets/characters/donald.png' },
  { value: 'Daisy', image: '/assets/characters/daisy.png' },
  { value: 'Goofy', image: '/assets/characters/goofy.png' },
  { value: 'Pluto', image: '/assets/characters/pluto.png' },
  { value: 'Chip', image: '/assets/characters/chip.png' },
  { value: 'Dale', image: '/assets/characters/dale.png' },
];

const MemoryGame: React.FC<MemoryGameProps> = ({ onGameComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const announce = useAnnouncer();
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const initializeGame = useCallback(() => {
    const initialCards: Card[] = [...cardImages, ...cardImages]
      .map((card, index) => ({
        id: index,
        value: card.value,
        image: card.image,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffleArray(initialCards));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setIsChecking(false);
    setFocusedCardIndex(null); // Reset focus on new game
    announce('New game started. Find matching pairs!');
  }, [announce]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (matchedCards.length === cardImages.length * 2) {
      announce('Congratulations! You found all the matches!');
      onGameComplete(cardImages.length);
    }
  }, [matchedCards, onGameComplete, announce]);

  useEffect(() => {
    // Announce game state for screen readers
    if (flippedCards.length === 1) {
      const firstCard = cards.find(card => card.id === flippedCards[0]);
      if (firstCard) {
        announce(`One card flipped: ${firstCard.value}.`);
      }
    } else if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);
      const matchesFoundCount = matchedCards.length / 2;
      announce(`${flippedCards.length} cards flipped. ${matchesFoundCount} matches found.`);
    }
  }, [flippedCards, matchedCards, cards, announce]);

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length === 2 || cards[id].isMatched || cards[id].isFlipped) {
      return;
    }

    const newCards = cards.map(card =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    setFlippedCards(prev => [...prev, id]);
    setFocusedCardIndex(id); // Keep focus on the clicked card
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        announce(`Match found! ${firstCard.value} and ${secondCard.value} are a pair.`);
        setMatchedCards(prev => [...prev, firstCardId, secondCardId]);
        setFlippedCards([]);
        setIsChecking(false);
      } else {
        announce('No match. Try again!');
        setTimeout(() => {
          const resetCards = cards.map(card =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false } : card
          );
          setCards(resetCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards, announce]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!cards.length) return;

    const numCards = cards.length;
    const numCols = 4; // Assuming a 4-column grid

    let nextFocusIndex = focusedCardIndex === null ? 0 : focusedCardIndex;

    if (event.key === 'ArrowRight') {
      nextFocusIndex = (nextFocusIndex + 1) % numCards;
    } else if (event.key === 'ArrowLeft') {
      nextFocusIndex = (nextFocusIndex - 1 + numCards) % numCards;
    } else if (event.key === 'ArrowDown') {
      nextFocusIndex = (nextFocusIndex + numCols) % numCards;
    } else if (event.key === 'ArrowUp') {
      nextFocusIndex = (nextFocusIndex - numCols + numCards) % numCards;
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault(); // Prevent scrolling with spacebar
      if (focusedCardIndex !== null) {
        handleCardClick(focusedCardIndex);
      }
      return; // Do not change focus after selection
    } else {
      return;
    }

    setFocusedCardIndex(nextFocusIndex);
    cardRefs.current[nextFocusIndex]?.focus();
  }, [cards, focusedCardIndex, handleCardClick]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-xl"
        role="grid"
        aria-label="Memory Game Board"
      >
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            id={card.id.toString()}
            image={card.image}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card.id)}
            cardValue={card.value}
            tabIndex={focusedCardIndex === index ? 0 : -1}
            ref={el => (cardRefs.current[index] = el)}
            aria-current={focusedCardIndex === index ? 'true' : undefined}
          />
        ))}
      </div>
      <button
        onClick={initializeGame}
        className="mt-6 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition duration-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="Reset game, press Space or Enter"
      >
        Reset Game
      </button>
      <p className="mt-4 text-xl font-semibold text-gray-700">Moves: {moves}</p>
    </div>
  );
};

export default MemoryGame;
