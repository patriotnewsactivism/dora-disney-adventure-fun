import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/Confetti";

const KingdomBuilder = () => {
  const buildings = [
    { id: "castle", emoji: "ð°", name: "Castle", points: 10 },
    { id: "house", emoji: "ð ", name: "House", points: 5 },
    { id: "tree", emoji: "ð³", name: "Tree", points: 3 },
    { id: "fountain", emoji: "â²", name: "Fountain", points: 7 },
  ];

  const [placed, setPlaced] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const placeBuilding = (building: typeof buildings[0]) => {
    setPlaced([...placed, building.emoji]);
    setPoints(prev => prev + building.points);
    if ((points + building.points) % 50 === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  return (
    <GameLayout title="Kingdom Builder! ð°">
      {showConfetti && <Confetti />}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Build Your Kingdom!</h2>
          <p className="text-2xl">Points: {points}</p>
        </div>

        <div className="bg-gradient-to-br from-green-200 to-blue-200 rounded-3xl p-8 min-h-[400px] mb-6 border-4 border-green-400">
          <div className="flex flex-wrap gap-4 text-6xl">
            {placed.map((emoji, i) => (
              <span key={i} className="animate-bounce">{emoji}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {buildings.map(building => (
            <button
              key={building.id}
              onClick={() => placeBuilding(building)}
              className="p-6 bg-white rounded-2xl border-4 border-purple-300 hover:scale-105 transition-all"
            >
              <div className="text-6xl mb-2">{building.emoji}</div>
              <p className="font-bold">{building.name}</p>
              <p className="text-sm">{building.points} pts</p>
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
};

export default KingdomBuilder;
