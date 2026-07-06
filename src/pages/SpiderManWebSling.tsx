import { useState, useEffect, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";

interface Building {
  id: number;
  x: number;
  height: number;
}

const SpiderManWebSling = () => {
  const [spideyX, setSpideyX] = useState(10);
  const [spideyY, setSpideyY] = useState(50);
  const [isSwinging, setIsSwinging] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize buildings
    const initialBuildings: Building[] = [];
    for (let i = 0; i < 10; i++) {
      initialBuildings.push({
        id: i,
        x: i * 25,
        height: 40 + Math.random() * 40,
      });
    }
    setBuildings(initialBuildings);
  }, []);

  useEffect(() => {
    if (!gameOver) {
      gameLoopRef.current = setInterval(() => {
        // Move buildings left
        setBuildings(prev => {
          const updated = prev.map(b => ({ ...b, x: b.x - 1 }));

          // Add new building when needed
          if (updated[updated.length - 1].x < 75) {
            updated.push({
              id: Date.now(),
              x: 100,
              height: 40 + Math.random() * 40,
            });
          }

          // Remove off-screen buildings
          return updated.filter(b => b.x > -25);
        });

        // Auto-move Spidey forward
        setSpideyX(prev => {
          const newX = prev + 0.3;
          if (newX > 100) {
            setGameOver(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            return 100;
          }
          return newX;
        });

        // Apply gravity when not swinging
        if (!isSwinging) {
          setSpideyY(prev => Math.min(prev + 1.5, 90));
        }

        setScore(prev => prev + 1);
      }, 50);

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameOver, isSwinging]);

  // Check collisions
  useEffect(() => {
    const currentBuilding = buildings.find(b =>
      Math.abs(b.x - spideyX) < 5
    );

    if (currentBuilding && spideyY > 95 - currentBuilding.height) {
      setGameOver(true);
    }
  }, [spideyX, spideyY, buildings]);

  const handleTap = () => {
    if (gameOver) return;

    setIsSwinging(true);
    setSpideyY(prev => Math.max(prev - 15, 10));

    setTimeout(() => {
      setIsSwinging(false);
    }, 300);
  };

  const resetGame = () => {
    setSpideyX(10);
    setSpideyY(50);
    setIsSwinging(false);
    setScore(0);
    setGameOver(false);
    setShowConfetti(false);

    const initialBuildings: Building[] = [];
    for (let i = 0; i < 10; i++) {
      initialBuildings.push({
        id: i,
        x: i * 25,
        height: 40 + Math.random() * 40,
      });
    }
    setBuildings(initialBuildings);
  };

  const hasWon = spideyX >= 100;

  return (
    <GameLayout title="Spider-Man Web Slinging! 🕷️">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Swing Through the City!
          </h2>
          <p className="text-xl text-muted-foreground">
            Tap to swing up! Don't hit the buildings!
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center px-4">
          <div className="text-2xl font-bold">
            Score: <span className="text-primary">{Math.floor(score / 10)}</span>
          </div>
          <div className="text-2xl font-bold">
            Progress: <span className="text-accent">{Math.floor(spideyX)}%</span>
          </div>
        </div>

        {/* Game Area */}
        <div
          onClick={handleTap}
          className={cn(
            "relative h-96 bg-gradient-to-b from-sky-300 to-sky-100 rounded-2xl border-4 border-primary overflow-hidden cursor-pointer",
            gameOver && "opacity-75"
          )}
        >
          {/* Sun */}
          <div className="absolute top-4 right-4 text-6xl">☀️</div>

          {/* Clouds */}
          <div className="absolute top-8 left-1/4 text-4xl opacity-50">☁️</div>
          <div className="absolute top-16 right-1/3 text-4xl opacity-50">☁️</div>

          {/* Buildings */}
          {buildings.map(building => (
            <div
              key={building.id}
              className="absolute bottom-0 bg-gray-600 border-2 border-gray-800"
              style={{
                left: `${building.x}%`,
                height: `${building.height}%`,
                width: '20%',
              }}
            >
              {/* Windows */}
              <div className="grid grid-cols-3 gap-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full h-3 bg-yellow-300 rounded-sm" />
                ))}
              </div>
            </div>
          ))}

          {/* Spider-Man */}
          <div
            className="absolute transition-all duration-100"
            style={{
              left: `${spideyX}%`,
              top: `${spideyY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={cn(
              "text-6xl transition-transform",
              isSwinging && "rotate-45"
            )}>
              🕷️
            </div>
            {isSwinging && (
              <div className="absolute -top-20 left-1/2 w-0.5 h-20 bg-white" />
            )}
          </div>

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-green-600" />
        </div>

        {/* Controls and Status */}
        <div className="text-center mt-6 space-y-4">
          {hasWon && (
            <div className="animate-bounce">
              <h2 className="text-5xl font-bold text-success mb-2">
                🏆 Amazing! 🏆
              </h2>
              <p className="text-2xl text-muted-foreground">
                You made it across the city! Score: {Math.floor(score / 10)}
              </p>
            </div>
          )}

          {gameOver && !hasWon && (
            <div>
              <h2 className="text-4xl font-bold text-destructive mb-2">
                Oops! Try Again!
              </h2>
              <p className="text-xl text-muted-foreground">
                You hit a building! Score: {Math.floor(score / 10)}
              </p>
            </div>
          )}

          {!gameOver && (
            <p className="text-2xl text-primary font-bold animate-pulse">
              Tap to Swing! 🕸️
            </p>
          )}

          <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
            <RotateCcw className="mr-2 h-6 w-6" />
            {gameOver ? "Play Again" : "Restart"}
          </Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default SpiderManWebSling;
