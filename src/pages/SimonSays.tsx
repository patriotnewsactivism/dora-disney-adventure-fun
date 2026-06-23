import { useState, useEffect, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";

const SimonSays = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  const colors = [
    { id: 0, name: "Red", color: "bg-red-500", sound: 262 },
    { id: 1, name: "Blue", color: "bg-blue-500", sound: 330 },
    { id: 2, name: "Green", color: "bg-green-500", sound: 392 },
    { id: 3, name: "Yellow", color: "bg-yellow-500", sound: 494 },
  ];

  const playSound = (frequency: number) => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const playSequence = async () => {
    setIsPlaying(true);
    setIsUserTurn(false);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveButton(sequence[i]);
      playSound(colors[sequence[i]].sound);
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveButton(null);
    }

    setIsPlaying(false);
    setIsUserTurn(true);
  };

  const startGame = () => {
    const firstColor = Math.floor(Math.random() * 4);
    setSequence([firstColor]);
    setUserSequence([]);
    setScore(0);
    setGameOver(false);
    setShowConfetti(false);
    setIsUserTurn(false);
  };

  useEffect(() => {
    if (sequence.length > 0 && !isUserTurn && !gameOver) {
      playSequence();
    }
  }, [sequence]);

  const handleColorClick = (colorId: number) => {
    if (!isUserTurn || isPlaying || gameOver) return;

    playSound(colors[colorId].sound);
    setActiveButton(colorId);
    setTimeout(() => setActiveButton(null), 300);

    const newUserSequence = [...userSequence, colorId];
    setUserSequence(newUserSequence);

    // Check if correct
    if (colorId !== sequence[newUserSequence.length - 1]) {
      setGameOver(true);
      setIsUserTurn(false);
      return;
    }

    // Check if sequence complete
    if (newUserSequence.length === sequence.length) {
      setScore(prev => prev + 1);
      setUserSequence([]);
      setIsUserTurn(false);

      if (score + 1 >= 5 && !showConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Add new color to sequence
      setTimeout(() => {
        const newColor = Math.floor(Math.random() * 4);
        setSequence(prev => [...prev, newColor]);
      }, 1000);
    }
  };

  return (
    <GameLayout title="Simon Says! ðµ">
      {showConfetti && <Confetti />}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Remember the Pattern!
          </h2>
          <p className="text-xl text-muted-foreground">
            Watch the sequence, then repeat it!
          </p>
        </div>

        <div className="mb-8 text-center">
          <div className="text-4xl font-bold mb-4">
            Level: <span className="text-primary">{score + 1}</span>
          </div>
          {isPlaying && (
            <p className="text-2xl text-accent animate-pulse">
              Watch Carefully! ð
            </p>
          )}
          {isUserTurn && (
            <p className="text-2xl text-success animate-pulse">
              Your Turn! Tap the Colors! ð
            </p>
          )}
          {gameOver && (
            <div>
              <h2 className="text-4xl font-bold text-destructive mb-2">
                {score >= 5 ? "ð Great Job! ð" : "Oops! Try Again!"}
              </h2>
              <p className="text-2xl text-muted-foreground">
                You reached level {score + 1}!
              </p>
            </div>
          )}
        </div>

        {/* Game Buttons */}
        <div className="grid grid-cols-2 gap-6 mb-8 max-w-lg mx-auto">
          {colors.map(color => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.id)}
              disabled={!isUserTurn || isPlaying}
              className={cn(
                "aspect-square rounded-3xl border-4 border-black transition-all duration-150",
                color.color,
                activeButton === color.id && "scale-95 brightness-150 shadow-2xl",
                isUserTurn && !isPlaying && "hover:scale-105 hover:shadow-xl cursor-pointer",
                (!isUserTurn || isPlaying) && "opacity-75 cursor-not-allowed"
              )}
            >
              <span className="text-3xl font-bold text-white drop-shadow-lg">
                {color.name}
              </span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="text-center space-y-4">
          {!isPlaying && !isUserTurn && !gameOver && sequence.length === 0 && (
            <Button onClick={startGame} size="lg" className="text-2xl px-12 py-8">
              Start Game!
            </Button>
          )}

          {gameOver && (
            <Button onClick={startGame} size="lg" className="text-xl px-8 py-6">
              <RotateCcw className="mr-2 h-6 w-6" />
              Play Again
            </Button>
          )}

          {sequence.length > 0 && (
            <p className="text-lg text-muted-foreground">
              Sequence Length: {sequence.length} | Progress: {userSequence.length}/{sequence.length}
            </p>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default SimonSays;
