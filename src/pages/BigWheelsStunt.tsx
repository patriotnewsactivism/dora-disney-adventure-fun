import { useState, useEffect, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";

interface Obstacle {
  id: number;
  x: number;
  y?: number;
  type: string;
  emoji: string;
}

const BigWheelsStunt = () => {
  const [bikeX, setBikeX] = useState(50);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [level, setLevel] = useState(1);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const obstacleTypes = [
    { type: "cone", emoji: "ð§" },
    { type: "rock", emoji: "ðª¨" },
    { type: "puddle", emoji: "ð§" },
    { type: "flower", emoji: "ð¸" },
  ];

  useEffect(() => {
    if (!gameOver) {
      gameLoopRef.current = setInterval(() => {
        // Move obstacles down
        setObstacles(prev => {
          const updated = prev.map(o => ({ ...o, y: (o.y || 0) + 2 }));

          // Remove off-screen obstacles
          const filtered = updated.filter(o => (o.y || 0) < 100);

          // Add new obstacle randomly
          if (Math.random() < 0.02 + level * 0.005) {
            const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            filtered.push({
              id: Date.now(),
              x: Math.random() * 80 + 10,
              type: randomType.type,
              emoji: randomType.emoji,
              y: -5,
            } as Obstacle & { y: number });
          }

          return filtered;
        });

        setScore(prev => prev + 1);

        // Level up every 500 points
        if (score % 500 === 0 && score > 0) {
          setLevel(prev => prev + 1);
        }
      }, 50);

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameOver, level, score]);

  // Check collisions
  useEffect(() => {
    const collision = obstacles.find(o => {
      const obstacleY = (o as Obstacle & { y: number }).y || 0;
      return (
        Math.abs(o.x - bikeX) < 8 &&
        obstacleY > 80 &&
        obstacleY < 95
      );
    });

    if (collision) {
      setGameOver(true);
      if (score > 500) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [obstacles, bikeX, score]);

  const moveLeft = () => {
    setBikeX(prev => Math.max(prev - 10, 10));
  };

  const moveRight = () => {
    setBikeX(prev => Math.min(prev + 10, 90));
  };

  const resetGame = () => {
    setBikeX(50);
    setScore(0);
    setGameOver(false);
    setShowConfetti(false);
    setObstacles([]);
    setLevel(1);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  return (
    <GameLayout title="Big Wheels Stunt Course! ð²">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Dodge the Obstacles!
          </h2>
          <p className="text-xl text-muted-foreground">
            Use buttons or arrow keys to steer!
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center px-4">
          <div className="text-2xl font-bold">
            Score: <span className="text-primary">{score}</span>
          </div>
          <div className="text-2xl font-bold">
            Level: <span className="text-accent">{level}</span>
          </div>
        </div>

        {/* Game Area */}
        <div
          className={cn(
            "relative h-[500px] bg-gradient-to-b from-gray-300 to-gray-400 rounded-2xl border-4 border-primary overflow-hidden",
            gameOver && "opacity-75"
          )}
        >
          {/* Road lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-yellow-300 opacity-50" />
          <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-white opacity-30 dash-line" />
          <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-white opacity-30 dash-line" />

          {/* Obstacles */}
          {obstacles.map(obstacle => (
            <div
              key={obstacle.id}
              className="absolute text-5xl transition-all duration-100"
              style={{
                left: `${obstacle.x}%`,
                top: `${(obstacle as Obstacle & { y: number }).y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {obstacle.emoji}
            </div>
          ))}

          {/* Big Wheel / Bike */}
          <div
            className="absolute bottom-16 transition-all duration-200"
            style={{
              left: `${bikeX}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-7xl">
              ð²
            </div>
          </div>

          {/* Finish line indicators on sides */}
          <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-white via-black to-white opacity-20" />
          <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-r from-white via-black to-white opacity-20" />
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          {gameOver && (
            <div className="text-center">
              <h2 className="text-4xl font-bold text-destructive mb-2">
                {score > 500 ? "ð Great Run! ð" : "Crash! Try Again!"}
              </h2>
              <p className="text-2xl text-muted-foreground">
                Final Score: {score} | Level: {level}
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button
              onClick={moveLeft}
              size="lg"
              className="text-2xl px-12 py-8"
              disabled={gameOver}
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <Button
              onClick={moveRight}
              size="lg"
              className="text-2xl px-12 py-8"
              disabled={gameOver}
            >
              <ArrowRight className="h-8 w-8" />
            </Button>
          </div>

          <div className="text-center">
            <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
              <RotateCcw className="mr-2 h-6 w-6" />
              {gameOver ? "Play Again" : "Restart"}
            </Button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default BigWheelsStunt;
