import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";

const PixieFlight = () => {
  const [position, setPosition] = useState(50);
  const [obstacles, setObstacles] = useState<{ id: number; position: number; top: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setObstacles(prev => {
        const newObs = prev.map(o => ({ ...o, position: o.position - 2 })).filter(o => o.position > -10);
        if (Math.random() < 0.02) {
          newObs.push({ id: Date.now(), position: 100, top: Math.random() * 80 + 10 });
        }

        newObs.forEach(o => {
          if (o.position < 15 && o.position > 5 && Math.abs(position - o.top) < 12) {
            setGameOver(true);
          }
        });

        return newObs;
      });

      setScore(prev => prev + 1);
      if (score % 100 === 0 && score > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver, position, score]);

  return (
    <GameLayout title="Pixie Flight! ð§">
      {showConfetti && <Confetti />}
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-2xl mb-4">Score: {score}</p>
        {!gameOver ? (
          <>
            <div className="relative bg-gradient-to-br from-green-200 to-pink-200 rounded-3xl h-[500px] border-4 border-green-400 overflow-hidden mb-6">
              <div className="absolute left-[10%] text-6xl" style={{ top: `${position}%` }}>ð§</div>
              {obstacles.map(o => <div key={o.id} className="absolute text-6xl" style={{ left: `${o.position}%`, top: `${o.top}%` }}>ð³</div>)}
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setPosition(p => Math.max(10, p - 15))} size="lg">â¬ï¸ Up</Button>
              <Button onClick={() => setPosition(p => Math.min(90, p + 15))} size="lg">â¬ï¸ Down</Button>
            </div>
          </>
        ) : (
          <div>
            <div className="text-8xl mb-4">ð«</div>
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl mb-6">Final Score: {score}</p>
            <Button onClick={() => { setGameOver(false); setPosition(50); setObstacles([]); setScore(0); }} size="lg">
              <RotateCcw className="mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default PixieFlight;
