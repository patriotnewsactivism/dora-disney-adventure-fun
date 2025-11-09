import { useState, useEffect } from "react";
import MemoryCard from "./MemoryCard";
import Confetti from "./Confetti";
import { Button } from "./ui/button";
import { Shuffle } from "lucide-react";

// Import character images
import doraImg from "@/assets/dora.png";
import mickeyImg from "@/assets/mickey.png";
import minnieImg from "@/assets/minnie.png";
import elsaImg from "@/assets/elsa.png";
import simbaImg from "@/assets/simba.png";
import moanaImg from "@/assets/moana.png";

interface Card {
  id: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const characters = [
  { name: "Dora", image: doraImg },
  { name: "Mickey", image: mickeyImg },
  { name: "Minnie", image: minnieImg },
  { name: "Elsa", image: elsaImg },
  { name: "Simba", image: simbaImg },
  { name: "Moana", image: moanaImg },
];

const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize game
  const initGame = () => {
    const gameCards: Card[] = [];
    characters.forEach((char, index) => {
      // Create two cards for each character
      gameCards.push({
        id: `${char.name}-1-${index}`,
        image: char.image,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: `${char.name}-2-${index}`,
        image: char.image,
        isFlipped: false,
        isMatched: false,
      });
    });
    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setShowConfetti(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Check for win
  useEffect(() => {
    if (matchedPairs === characters.length && matchedPairs > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [matchedPairs]);

  const handleCardClick = (clickedId: string) => {
    // Don't allow more than 2 cards flipped
    if (flippedCards.length >= 2) return;

    // Flip the card
    setCards((prev) =>
      prev.map((card) =>
        card.id === clickedId ? { ...card, isFlipped: true } : card
      )
    );

    const newFlipped = [...flippedCards, clickedId];
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.image === secondCard.image) {
        // Match found!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchedPairs((prev) => prev + 1);
          setFlippedCards([]);
        }, 600);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isWon = matchedPairs === characters.length && matchedPairs > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {showConfetti && <Confetti />}

      <div className="mb-8 text-center">
        <h1 className="text-5xl md:text-6xl mb-4 text-primary">
          Memory Match! 🎮
        </h1>
        <p className="text-2xl text-muted-foreground mb-6">
          Find all the matching character pairs!
        </p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-white rounded-2xl px-6 py-3 shadow-lg border-4 border-primary">
            <p className="text-sm text-muted-foreground">Moves</p>
            <p className="text-3xl font-bold text-primary">{moves}</p>
          </div>
          <div className="bg-white rounded-2xl px-6 py-3 shadow-lg border-4 border-success">
            <p className="text-sm text-muted-foreground">Matches</p>
            <p className="text-3xl font-bold text-success">
              {matchedPairs}/{characters.length}
            </p>
          </div>
        </div>

        {isWon && (
          <div className="mb-6 animate-bounce">
            <h2 className="text-4xl font-bold text-success mb-2">
              🎉 You Won! 🎉
            </h2>
            <p className="text-xl text-muted-foreground">
              Great job! You found all the pairs in {moves} moves!
            </p>
          </div>
        )}

        <Button
          onClick={initGame}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg text-xl px-8 py-6 rounded-2xl"
        >
          <Shuffle className="mr-2 h-6 w-6" />
          New Game
        </Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            id={card.id}
            image={card.image}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;
