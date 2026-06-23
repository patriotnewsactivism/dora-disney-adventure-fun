import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/Confetti";

const FrozenMaze = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const gridSize = 5;
  const goal = { x: 4, y: 4 };

  const move = (dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(gridSize - 1, position.x + dx));
    const newY = Math.max(0, Math.min(gridSize - 1, position.y + dy));
    setPosition({ x: newX, y: newY });

    if (newX === goal.x && newY === goal.y) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setPosition({ x: 0, y: 0 });
      }, 2000);
    }
  };

  return (
    <GameLayout title="Frozen Maze! ð§">
      {showConfetti && <Confetti />}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Help Anna Find Elsa!</h2>
        <p className="text-2xl mb-6">Mazes Solved: {score}</p>

        <div className="bg-gradient-to-br from-cyan-100 to-blue-200 p-8 rounded-3xl border-4 border-cyan-400 mb-6">
          <div className="grid grid-cols-5 gap-2">
            {Array(gridSize * gridSize).fill(0).map((_, i) => {
              const x = i % gridSize;
              const y = Math.floor(i / gridSize);
              const isPlayer = x === position.x && y === position.y;
              const isGoal = x === goal.x && y === goal.y;

              return (
                <div key={i} className="aspect-square bg-white rounded-lg border-2 border-cyan-300 flex items-center justify-center text-4xl">
                  {isPlayer && "ð§"}
                  {isGoal && "âï¸"}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          <div />
          <Button onClick={() => move(0, -1)} size="lg">â¬ï¸</Button>
          <div />
          <Button onClick={() => move(-1, 0)} size="lg">â¬ï¸</Button>
          <div />
          <Button onClick={() => move(1, 0)} size="lg">â¡ï¸</Button>
          <div />
          <Button onClick={() => move(0, 1)} size="lg">â¬ï¸</Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default FrozenMaze;
