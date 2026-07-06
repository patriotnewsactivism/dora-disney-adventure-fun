import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";
import arielImg from "@/assets/ariel.png";

interface Treasure {
  id: number;
  name: string;
  emoji: string;
  description: string;
  found: boolean;
}

const ArielTreasure = () => {
  const initialTreasures: Treasure[] = [
    { id: 1, name: "Fork (Dinglehopper)", emoji: "🍴", description: "Used for combing hair!", found: false },
    { id: 2, name: "Spyglass", emoji: "🔭", description: "See far away things!", found: false },
    { id: 3, name: "Music Box", emoji: "🎵", description: "Plays beautiful melodies!", found: false },
    { id: 4, name: "Statue", emoji: "🗿", description: "A mysterious figure!", found: false },
    { id: 5, name: "Book", emoji: "📖", description: "Full of human stories!", found: false },
    { id: 6, name: "Crown", emoji: "👑", description: "Worn by royalty!", found: false },
    { id: 7, name: "Compass", emoji: "🧭", description: "Shows directions!", found: false },
    { id: 8, name: "Bell", emoji: "🔔", description: "Makes pretty sounds!", found: false },
  ];

  const [treasures, setTreasures] = useState(initialTreasures);
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const findTreasure = (treasure: Treasure) => {
    if (treasure.found) return;

    setTreasures(prev =>
      prev.map(t => (t.id === treasure.id ? { ...t, found: true } : t))
    );
    setSelectedTreasure(treasure);

    const allFound = treasures.filter(t => t.id !== treasure.id).every(t => t.found);
    if (allFound) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const resetGame = () => {
    setTreasures(initialTreasures);
    setSelectedTreasure(null);
    setShowConfetti(false);
  };

  const foundCount = treasures.filter(t => t.found).length;
  const allFound = treasures.every(t => t.found);

  return (
    <GameLayout title="Ariel's Treasure Hunt! 🧜‍♀️">
      {showConfetti && <Confetti />}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img src={arielImg} alt="Ariel" className="w-20 h-20 object-contain" />
            <div>
              <h2 className="text-3xl font-bold text-cyan-600">
                Find Human Treasures!
              </h2>
              <p className="text-xl text-muted-foreground">
                Help Ariel collect amazing things!
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold">
            Found: <span className="text-cyan-600">{foundCount}/{treasures.length}</span>
          </div>
        </div>

        {!allFound && selectedTreasure && (
          <div className="mb-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl border-4 border-cyan-400 p-8 text-center animate-bounce">
            <div className="text-7xl mb-4">{selectedTreasure.emoji}</div>
            <h3 className="text-3xl font-bold text-cyan-700 mb-2">
              {selectedTreasure.name}
            </h3>
            <p className="text-2xl text-cyan-600 italic">
              {selectedTreasure.description}
            </p>
          </div>
        )}

        {!allFound ? (
          <div className="relative bg-gradient-to-br from-blue-200 via-cyan-100 to-teal-100 rounded-3xl border-4 border-cyan-400 p-8 min-h-[500px]">
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-cyan-700">
                Click around to find treasures! 🐚
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {treasures.map(treasure => (
                <button
                  key={treasure.id}
                  onClick={() => findTreasure(treasure)}
                  disabled={treasure.found}
                  className={`aspect-square rounded-3xl border-4 transition-all ${
                    treasure.found
                      ? "bg-cyan-200 border-cyan-300 opacity-50 cursor-default"
                      : "bg-gradient-to-br from-blue-400 to-cyan-500 border-blue-600 hover:scale-110 cursor-pointer animate-pulse"
                  }`}
                >
                  {treasure.found ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-6xl opacity-50">{treasure.emoji}</div>
                      <p className="text-sm font-bold text-cyan-700 mt-2">Found!</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-7xl">🐚</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">🧜‍♀️</div>
            <h2 className="text-5xl font-bold text-cyan-600 mb-4">
              Collection Complete!
            </h2>
            <p className="text-3xl text-muted-foreground mb-6">
              You found all of Ariel's treasures!
            </p>
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl border-4 border-cyan-400 p-8 mb-6">
              <h3 className="text-3xl font-bold text-cyan-700 mb-6">
                Your Collection:
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {treasures.map(treasure => (
                  <div key={treasure.id} className="text-center">
                    <div className="text-6xl mb-2">{treasure.emoji}</div>
                    <p className="text-sm font-bold text-cyan-700">{treasure.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={resetGame} size="lg" className="text-2xl px-12 py-8">
              <RotateCcw className="mr-2 h-8 w-8" />
              Hunt Again
            </Button>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default ArielTreasure;
