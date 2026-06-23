import { useState, useEffect, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";
import mickeyImg from "@/assets/mickey.png";
import minnieImg from "@/assets/minnie.png";
import doraImg from "@/assets/dora.png";

const WhackAMole = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeMoles, setActiveMoles] = useState<Set<number>>(new Set());
  const [gameActive, setGameActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const characters = [mickeyImg, minnieImg, doraImg];
  const gridSize = 9;

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
            if (score > 10) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      };
    }
  }, [gameActive, timeLeft, score]);

  useEffect(() => {
    if (gameActive) {
      moleTimerRef.current = setInterval(() => {
        // Random moles pop up
        const numMoles = Math.floor(Math.random() * 3) + 1;
        const newMoles = new Set<number>();

        for (let i = 0; i < numMoles; i++) {
          const randomHole = Math.floor(Math.random() * gridSize);
          newMoles.add(randomHole);
        }

        setActiveMoles(newMoles);

        // Hide moles after a delay
        setTimeout(() => {
          setActiveMoles(new Set());
        }, 800);
      }, 1200);

      return () => {
        if (moleTimerRef.current) clearInterval(moleTimerRef.current);
      };
    }
  }, [gameActive]);

  const handleWhack = (index: number) => {
    if (activeMoles.has(index)) {
      setScore(prev => prev + 1);
      setActiveMoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setShowConfetti(false);
    setActiveMoles(new Set());
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(false);
    setShowConfetti(false);
    setActiveMoles(new Set());
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moleTimerRef.current) clearInterval(moleTimerRef.current);
  };

  return (
    <GameLayout title="Whack-A-Character! ð¯">
      {showConfetti && <Confetti />}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Tap the Characters!
          </h2>
          <p className="text-xl text-muted-foreground">
            Quick! Tap them before they disappear!
          </p>
        </div>

        <div className="flex justify-between items-center mb-6 px-4">
          <div className="text-3xl font-bold">
            Score: <span className="text-primary">{score}</span>
          </div>
          <div className="text-3xl font-bold">
            Time: <span className={cn(
              "text-accent",
              timeLeft < 10 && "text-destructive animate-pulse"
            )}>{timeLeft}s</span>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: gridSize }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleWhack(index)}
              disabled={!gameActive || !activeMoles.has(index)}
              className={cn(
                "aspect-square rounded-3xl border-4 transition-all duration-200 relative overflow-hidden",
                activeMoles.has(index)
                  ? "bg-gradient-to-br from-yellow-200 to-yellow-400 border-yellow-600 shadow-2xl scale-105 cursor-pointer"
                  : "bg-gradient-to-br from-green-700 to-green-900 border-green-800 cursor-default"
              )}
            >
              {activeMoles.has(index) && (
                <img
                  src={characters[index % characters.length]}
                  alt="Character"
                  className="w-full h-full object-contain p-2 animate-bounce"
                />
              )}
              {!activeMoles.has(index) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-4 bg-black opacity-30 rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Controls and Status */}
        <div className="text-center space-y-4">
          {!gameActive && timeLeft === 0 && (
            <div>
              <h2 className="text-5xl font-bold text-success mb-2">
                {score > 15 ? "ð Awesome! ð" : "â­ Good Try! â­"}
              </h2>
              <p className="text-2xl text-muted-foreground">
                Final Score: {score}
              </p>
            </div>
          )}

          {!gameActive && timeLeft === 30 && (
            <Button onClick={startGame} size="lg" className="text-2xl px-12 py-8">
              Start Game!
            </Button>
          )}

          {gameActive && (
            <p className="text-2xl text-primary font-bold animate-pulse">
              Tap Them Quick! ð
            </p>
          )}

          {!gameActive && timeLeft === 0 && (
            <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
              <RotateCcw className="mr-2 h-6 w-6" />
              Play Again
            </Button>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default WhackAMole;
