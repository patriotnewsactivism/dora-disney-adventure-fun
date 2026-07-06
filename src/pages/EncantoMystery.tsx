import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles, Gift } from "lucide-react";
import Confetti from "@/components/Confetti";
import belleImg from "@/assets/belle.png";
import moanaImg from "@/assets/moana.png";

interface Door {
  id: number;
  gift: string;
  emoji: string;
  riddle: string;
  opened: boolean;
}

const EncantoMystery = () => {
  const initialDoors: Door[] = [
    { id: 1, gift: "Super Strength", emoji: "💪", riddle: "I can lift anything, no matter how heavy!", opened: false },
    { id: 2, gift: "Healing", emoji: "🌺", riddle: "I make people feel better with food!", opened: false },
    { id: 3, gift: "Weather Control", emoji: "⛈️", riddle: "My emotions change the weather!", opened: false },
    { id: 4, gift: "Shape Shifting", emoji: "🦎", riddle: "I can look like anyone!", opened: false },
    { id: 5, gift: "Perfect Hearing", emoji: "👂", riddle: "I can hear everything, even whispers!", opened: false },
    { id: 6, gift: "Talking to Animals", emoji: "🐾", riddle: "Animals tell me their secrets!", opened: false },
  ];

  const [doors, setDoors] = useState(initialDoors);
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const openDoor = (door: Door) => {
    if (door.opened) return;

    setSelectedDoor(door);
    setDoors(prev =>
      prev.map(d => (d.id === door.id ? { ...d, opened: true } : d))
    );
    setScore(prev => prev + 10);

    const allOpened = doors.filter(d => d.id !== door.id).every(d => d.opened);
    if (allOpened) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const resetGame = () => {
    setDoors(initialDoors);
    setSelectedDoor(null);
    setScore(0);
    setShowConfetti(false);
  };

  const allDoorsOpened = doors.every(d => d.opened);

  return (
    <GameLayout title="Encanto Mystery Doors! 🚪">
      {showConfetti && <Confetti />}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Gift className="h-12 w-12 text-yellow-500" />
            <div>
              <h2 className="text-3xl font-bold text-primary">
                Discover Magical Gifts!
              </h2>
              <p className="text-xl text-muted-foreground">
                Open doors to reveal powers!
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold">
            Score: <span className="text-primary">{score}</span>
          </div>
        </div>

        {!allDoorsOpened ? (
          <>
            {selectedDoor && (
              <div className="mb-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl border-4 border-yellow-400 p-8 text-center animate-bounce">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img src={moanaImg} alt="Character" className="w-16 h-16 object-contain" />
                  <div>
                    <div className="text-6xl mb-2">{selectedDoor.emoji}</div>
                    <h3 className="text-3xl font-bold text-yellow-800">
                      {selectedDoor.gift}
                    </h3>
                  </div>
                </div>
                <p className="text-2xl text-yellow-900 italic">
                  "{selectedDoor.riddle}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {doors.map(door => (
                <button
                  key={door.id}
                  onClick={() => openDoor(door)}
                  disabled={door.opened}
                  className={`aspect-square rounded-3xl border-4 transition-all ${
                    door.opened
                      ? "bg-gradient-to-br from-yellow-200 to-orange-200 border-yellow-400 cursor-default"
                      : "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-700 hover:scale-105 cursor-pointer"
                  }`}
                >
                  {door.opened ? (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className="text-7xl mb-2">{door.emoji}</div>
                      <p className="text-xl font-bold text-yellow-800">
                        {door.gift}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-8xl mb-2">🚪</div>
                      <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src={belleImg} alt="Character" className="w-24 h-24 object-contain" />
              <div>
                <div className="text-8xl mb-2">🎊</div>
                <h2 className="text-5xl font-bold text-yellow-600 mb-2">
                  All Gifts Revealed!
                </h2>
              </div>
            </div>
            <p className="text-3xl text-muted-foreground mb-6">
              You've discovered all the magical gifts of Encanto!
            </p>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl border-4 border-yellow-400 p-8 mb-6">
              <p className="text-4xl font-bold text-yellow-600 mb-4">
                Final Score: {score}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-5xl">
                {doors.map(door => (
                  <div key={door.id}>{door.emoji}</div>
                ))}
              </div>
            </div>

            <Button onClick={resetGame} size="lg" className="text-2xl px-12 py-8">
              <RotateCcw className="mr-2 h-8 w-8" />
              Play Again
            </Button>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default EncantoMystery;
