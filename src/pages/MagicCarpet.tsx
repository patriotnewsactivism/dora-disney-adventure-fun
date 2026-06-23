import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";

const MagicCarpet = () => {
  const [position, setPosition] = useState(50);
  const [obstacles, setObstacles] = useState<{ id: number; position: number; top: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev
          .map(obs => ({ ...obs, position: obs.position - 3 }))
          .filter(obs => obs.position > -10);

        if (Math.random() < 0.02) {
          newObstacles.push({
            id: Date.now(),
            position: 100,
            top: Math.random() * 70 + 10,
          });
        }

        newObstacles.forEach(obs => {
          if (obs.position < 15 && obs.position > 5 && Math.abs(position - obs.top) < 15) {
            setGameOver(true);
          }
        });

        return newObstacles;
      });

      setScore(prev => prev + 1);

      if (score > 0 && score % 100 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver, position, score]);

  const moveUp = () => {
    if (!gameOver) setPosition(prev => Math.max(prev - 15, 10));
  };

  const moveDown = () => {
    if (!gameOver) setPosition(prev => Math.min(prev + 15, 90));
  };

  const resetGame = () => {
    setPosition(50);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <GameLayout title="Magic Carpet! ð§">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-600">Fly Through Agrabah!</h2>
          <div className="text-2xl font-bold">
            Score: <span className="text-primary">{score}</span>
          </div>
        </div>

        {!gameOver ? (
          <>
            <div className="relative bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 rounded-3xl border-4 border-purple-400 h-[500px] overflow-hidden mb-6">
              <div
                className="absolute left-[10%] text-6xl transition-all duration-100"
                style={{ top: `${position}%` }}
              >
                ð§
              </div>

              {obstacles.map(obs => (
                <div
                  key={obs.id}
                  className="absolute text-6xl"
                  style={{
                    left: `${obs.position}%`,
                    top: `${obs.top}%`,
                  }}
                >
                  ðï¸
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={moveUp} size="lg" className="text-2xl px-12 py-8">
                â¬ï¸ Up
              </Button>
              <Button onClick={moveDown} size="lg" className="text-2xl px-12 py-8">
                â¬ï¸ Down
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-8xl mb-4">ð¥</div>
            <h2 className="text-5xl font-bold text-purple-600 mb-4">Game Over!</h2>
            <p className="text-3xl text-muted-foreground mb-6">Final Score: {score}</p>
            <Button onClick={resetGame} size="lg" className="text-2xl px-12 py-8">
              <RotateCcw className="mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {score >= 200 && !gameOver && (
          <div className="mt-6 text-center">
            <h3 className="text-4xl font-bold text-purple-600">
              ð Master Flyer! ð
            </h3>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default MagicCarpet;
