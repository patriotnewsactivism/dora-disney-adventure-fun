import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";

const UnderSeaDance = () => {
  const [dancing, setDancing] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [freezeTime, setFreezeTime] = useState(false);

  useEffect(() => {
    if (!dancing) return;
    const interval = setInterval(() => {
      setFreezeTime(true);
      setTimeout(() => setFreezeTime(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, [dancing]);

  const handleDance = () => {
    if (!freezeTime && dancing) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  };

  return (
    <GameLayout title="Under the Sea Dance! 🐠">
      {showConfetti && <Confetti />}
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-8xl mb-4 animate-bounce">🧜‍♀️</div>
        <h2 className="text-4xl font-bold mb-4">{freezeTime ? "FREEZE! ❄️" : "DANCE! 💃"}</h2>
        <div className="bg-gradient-to-b from-blue-300 to-cyan-200 rounded-3xl p-8 mb-6 min-h-[300px] flex items-center justify-center">
          <p className="text-3xl">{freezeTime ? "Don't move!" : "Keep dancing!"}</p>
        </div>
        <div className="flex gap-4 justify-center">
          {!dancing ? (
            <Button onClick={() => setDancing(true)} size="lg">Start Dancing!</Button>
          ) : (
            <Button onClick={handleDance} disabled={freezeTime} size="lg">I'm Dancing!</Button>
          )}
          <Button onClick={() => { setDancing(false); setScore(0); }} variant="outline" size="lg"><RotateCcw /></Button>
        </div>
        <p className="mt-4 text-2xl">Score: {score}</p>
      </div>
    </GameLayout>
  );
};

export default UnderSeaDance;
