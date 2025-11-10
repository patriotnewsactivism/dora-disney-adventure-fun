import { useState, useEffect } from "react";
import MemoryCard from "./MemoryCard";
import Confetti from "./Confetti";
import { Button } from "./ui/button";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

// Import character images
import doraImg from "@/assets/dora.png";
import mickeyImg from "@/assets/mickey.png";
import minnieImg from "@/assets/minnie.png";
import elsaImg from "@/assets/elsa.png";
import simbaImg from "@/assets/simba.png";
import moanaImg from "@/assets/moana.png";
import cakepop1Img from "@/assets/cakepop-hunter1.png";
import cakepop2Img from "@/assets/cakepop-hunter2.png";
import cakepop3Img from "@/assets/cakepop-hunter3.png";
import cakepop4Img from "@/assets/cakepop-hunter4.png";
import bluesImg from "@/assets/blues.png";
import annaImg from "@/assets/anna.png";
import arielImg from "@/assets/ariel.png";
import belleImg from "@/assets/belle.png";
import rapunzelImg from "@/assets/rapunzel.png";
import buzzImg from "@/assets/buzz.png";

interface Card {
  id: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const allCharacters = [
  { name: "Dora", image: doraImg },
  { name: "Mickey", image: mickeyImg },
  { name: "Minnie", image: minnieImg },
  { name: "Elsa", image: elsaImg },
  { name: "Simba", image: simbaImg },
  { name: "Moana", image: moanaImg },
  { name: "Cake Pop Hunter", image: cakepop1Img },
  { name: "Cake Pop Warrior", image: cakepop2Img },
  { name: "Cake Pop Hero", image: cakepop3Img },
  { name: "Cake Pop Adventurer", image: cakepop4Img },
  { name: "Blues Clues", image: bluesImg },
  { name: "Anna", image: annaImg },
  { name: "Ariel", image: arielImg },
  { name: "Belle", image: belleImg },
  { name: "Rapunzel", image: rapunzelImg },
  { name: "Buzz Lightyear", image: buzzImg },
];

// Round configurations - each round gets progressively harder
const rounds = [
  { level: 1, pairs: 3, name: "Easy" },
  { level: 2, pairs: 4, name: "Medium" },
  { level: 3, pairs: 5, name: "Hard" },
  { level: 4, pairs: 5, name: "Expert" }, // Same pairs but they've done more rounds
];

const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize a specific round
  const initRound = (roundIndex: number) => {
    const round = rounds[roundIndex];
    const pairsNeeded = round.pairs;
    
    // Shuffle and select random characters for this round
    const shuffledChars = [...allCharacters].sort(() => Math.random() - 0.5);
    const selectedChars = shuffledChars.slice(0, pairsNeeded);
    
    const gameCards: Card[] = [];
    selectedChars.forEach((char, index) => {
      // Create two cards for each character
      gameCards.push({
        id: `${char.name}-1-${index}-r${roundIndex}`,
        image: char.image,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: `${char.name}-2-${index}-r${roundIndex}`,
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

  // Start new game from beginning
  const initGame = () => {
    setCurrentRound(0);
    setTotalMoves(0);
    setGameComplete(false);
    initRound(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Check for round completion
  useEffect(() => {
    const currentPairsNeeded = rounds[currentRound]?.pairs || 0;
    if (matchedPairs === currentPairsNeeded && matchedPairs > 0) {
      setShowConfetti(true);
      
      // Check if this was the last round
      if (currentRound === rounds.length - 1) {
        setGameComplete(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        // Move to next round after a delay
        setTimeout(() => {
          setShowConfetti(false);
          setTotalMoves(prev => prev + moves);
          setCurrentRound(prev => prev + 1);
        }, 2000);
      }
    }
  }, [matchedPairs, currentRound, moves]);

  // Initialize next round when currentRound changes
  useEffect(() => {
    if (currentRound > 0 && currentRound < rounds.length && !gameComplete) {
      initRound(currentRound);
    }
  }, [currentRound]);

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
      setTotalMoves((prev) => prev + 1);

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

  const currentPairsNeeded = rounds[currentRound]?.pairs || 0;
  const isRoundComplete = matchedPairs === currentPairsNeeded && matchedPairs > 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {showConfetti && <Confetti />}

      <div className="mb-8 text-center">
        <p className="text-2xl text-muted-foreground mb-6">
          Find all the matching character pairs!
        </p>

        {/* Round Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {rounds.map((round, index) => (
            <div
              key={index}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
                index < currentRound
                  ? "bg-success text-success-foreground shadow-lg scale-110"
                  : index === currentRound
                  ? "bg-primary text-primary-foreground shadow-lg scale-125 animate-pulse"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentRound ? "✓" : index + 1}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-accent mb-2">
            Round {currentRound + 1} - {rounds[currentRound]?.name}
          </h2>
          <p className="text-lg text-muted-foreground">
            Match {currentPairsNeeded} pairs to advance!
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-white rounded-2xl px-6 py-3 shadow-lg border-4 border-primary">
            <p className="text-sm text-muted-foreground">Round Moves</p>
            <p className="text-3xl font-bold text-primary">{moves}</p>
          </div>
          <div className="bg-white rounded-2xl px-6 py-3 shadow-lg border-4 border-accent">
            <p className="text-sm text-muted-foreground">Total Moves</p>
            <p className="text-3xl font-bold text-accent">{totalMoves + moves}</p>
          </div>
          <div className="bg-white rounded-2xl px-6 py-3 shadow-lg border-4 border-success">
            <p className="text-sm text-muted-foreground">Matches</p>
            <p className="text-3xl font-bold text-success">
              {matchedPairs}/{currentPairsNeeded}
            </p>
          </div>
        </div>

        {gameComplete && (
          <div className="mb-6 animate-bounce">
            <h2 className="text-4xl font-bold text-success mb-2">
              🎉 ALL ROUNDS COMPLETE! 🎉
            </h2>
            <p className="text-xl text-muted-foreground">
              Amazing! You beat all {rounds.length} rounds in {totalMoves + moves} total moves!
            </p>
          </div>
        )}

        {isRoundComplete && !gameComplete && (
          <div className="mb-6 animate-scale-in">
            <h2 className="text-3xl font-bold text-success mb-2">
              ⭐ Round {currentRound + 1} Complete! ⭐
            </h2>
            <p className="text-xl text-muted-foreground">
              Get ready for Round {currentRound + 2}...
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
