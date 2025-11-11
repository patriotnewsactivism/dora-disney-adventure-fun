import { useState, useEffect, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";

const MonsterTruckRacing = () => {
  const [truck Position, setTruckPosition] = useState(0);
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const raceRef = useRef<NodeJS.Timeout | null>(null);

  const trucks = [
    { id: 1, name: "Red Crusher", color: "bg-red-500", emoji: "🚗" },
    { id: 2, name: "Blue Thunder", color: "bg-blue-500", emoji: "🚙" },
    { id: 3, name: "Green Machine", color: "bg-green-500", emoji: "🚕" },
  ];

  const [selectedTruck, setSelectedTruck] = useState(trucks[0]);
  const [opponentProgress, setOpponentProgress] = useState(0);

  useEffect(() => {
    if (isRacing) {
      // Opponent auto-progress
      raceRef.current = setInterval(() => {
        setOpponentProgress(prev => {
          const newProgress = prev + Math.random() * 0.5;
          if (newProgress >= 100) {
            setIsRacing(false);
            return 100;
          }
          return newProgress;
        });
      }, 100);

      return () => {
        if (raceRef.current) clearInterval(raceRef.current);
      };
    }
  }, [isRacing]);

  useEffect(() => {
    // Check for win
    if (raceProgress >= 100 && isRacing) {
      setIsRacing(false);
      if (raceProgress >= opponentProgress) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [raceProgress, isRacing, opponentProgress]);

  const handleTap = () => {
    if (!isRacing) {
      setIsRacing(true);
    }

    setTapCount(prev => prev + 1);
    setRaceProgress(prev => {
      const newProgress = prev + 2;
      return Math.min(newProgress, 100);
    });
  };

  const resetRace = () => {
    setRaceProgress(0);
    setOpponentProgress(0);
    setIsRacing(false);
    setShowConfetti(false);
    setTapCount(0);
    if (raceRef.current) clearInterval(raceRef.current);
  };

  const hasWon = raceProgress >= 100 && raceProgress >= opponentProgress;
  const hasLost = opponentProgress >= 100 && opponentProgress > raceProgress;

  return (
    <GameLayout title="Monster Truck Racing! 🏁">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Tap to Make Your Truck Go!
          </h2>
          <p className="text-xl text-muted-foreground">
            Tap anywhere to race! First to finish wins! 🏁
          </p>
        </div>

        {/* Truck Selection */}
        {!isRacing && raceProgress === 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center mb-4">Pick Your Truck!</h3>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {trucks.map(truck => (
                <button
                  key={truck.id}
                  onClick={() => setSelectedTruck(truck)}
                  className={cn(
                    "p-6 rounded-2xl border-4 transition-all duration-200",
                    selectedTruck.id === truck.id
                      ? "border-primary scale-110 shadow-xl"
                      : "border-border hover:scale-105"
                  )}
                >
                  <div className="text-6xl mb-2">{truck.emoji}</div>
                  <p className="font-bold text-lg">{truck.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Race Track */}
        <div className="space-y-8 mb-8">
          {/* Player Track */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl font-bold">YOU</span>
              <span className="text-xl text-muted-foreground">{Math.floor(raceProgress)}%</span>
            </div>
            <div className="h-24 bg-gradient-to-r from-green-200 to-green-400 rounded-2xl border-4 border-green-600 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-green-800 opacity-20">
                🏁 🏁 🏁 🏁 🏁
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 text-6xl"
                style={{ left: `${raceProgress}%` }}
              >
                {selectedTruck.emoji}
              </div>
            </div>
          </div>

          {/* Opponent Track */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl font-bold">COMPUTER</span>
              <span className="text-xl text-muted-foreground">{Math.floor(opponentProgress)}%</span>
            </div>
            <div className="h-24 bg-gradient-to-r from-orange-200 to-orange-400 rounded-2xl border-4 border-orange-600 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-orange-800 opacity-20">
                🏁 🏁 🏁 🏁 🏁
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 text-6xl"
                style={{ left: `${opponentProgress}%` }}
              >
                🚌
              </div>
            </div>
          </div>
        </div>

        {/* Tap Area */}
        <div className="text-center space-y-6">
          {hasWon && (
            <div className="animate-bounce">
              <h2 className="text-5xl font-bold text-success mb-4">
                🏆 YOU WON! 🏆
              </h2>
              <p className="text-2xl text-muted-foreground">
                Great job! You tapped {tapCount} times!
              </p>
            </div>
          )}

          {hasLost && (
            <div>
              <h2 className="text-4xl font-bold text-destructive mb-4">
                Try Again!
              </h2>
              <p className="text-xl text-muted-foreground">
                You were so close! Tap faster next time!
              </p>
            </div>
          )}

          {!hasWon && !hasLost && (
            <button
              onClick={handleTap}
              className="w-full max-w-2xl h-48 bg-gradient-to-br from-primary to-secondary rounded-3xl border-8 border-primary shadow-2xl active:scale-95 transition-transform duration-100"
            >
              <span className="text-6xl font-bold text-white drop-shadow-lg">
                {isRacing ? "TAP! TAP! TAP!" : "TAP TO START!"}
              </span>
            </button>
          )}

          {isRacing && (
            <p className="text-2xl text-primary font-bold animate-pulse">
              Keep Tapping! 👆
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={resetRace} size="lg" className="text-xl px-8 py-6">
              <RotateCcw className="mr-2 h-6 w-6" />
              New Race
            </Button>
          </div>
        </div>

        {tapCount > 0 && (
          <div className="text-center mt-6">
            <p className="text-xl text-muted-foreground">
              Taps: {tapCount} | Speed: {(raceProgress / Math.max(tapCount, 1)).toFixed(1)}
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default MonsterTruckRacing;
