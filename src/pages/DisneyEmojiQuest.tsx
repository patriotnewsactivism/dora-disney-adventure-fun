import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";

const DisneyEmojiQuest = () => {
  const emojis = ["ð¸", "ð§", "ð¦", "ð ", "âï¸", "ð°"];
  const [grid, setGrid] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    resetGrid();
  }, []);

  const resetGrid = () => {
    const newGrid = Array(25).fill(0).map(() => emojis[Math.floor(Math.random() * emojis.length)]);
    setGrid(newGrid);
  };

  const handleClick = (index: number) => {
    const emoji = grid[index];
    const matches = [index];

    // Check horizontal neighbors
    if (index % 5 > 0 && grid[index - 1] === emoji) matches.push(index - 1);
    if (index % 5 < 4 && grid[index + 1] === emoji) matches.push(index + 1);

    if (matches.length >= 2) {
      setScore(prev => prev + matches.length);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);

      const newGrid = [...grid];
      matches.forEach(i => newGrid[i] = emojis[Math.floor(Math.random() * emojis.length)]);
      setGrid(newGrid);
    }
  };

  return (
    <GameLayout title="Disney Emoji Quest! ð">
      {showConfetti && <Confetti />}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Match the Emojis!</h2>
        <p className="text-2xl mb-6">Score: {score}</p>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {grid.map((emoji, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="aspect-square text-5xl bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl border-4 border-purple-300 hover:scale-110 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>

        <Button onClick={() => { resetGrid(); setScore(0); }} size="lg">
          <RotateCcw className="mr-2" />
          New Game
        </Button>
      </div>
    </GameLayout>
  );
};

export default DisneyEmojiQuest;
