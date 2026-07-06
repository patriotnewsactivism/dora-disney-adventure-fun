import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Timer } from "lucide-react";
import Confetti from "@/components/Confetti";
import elsaImg from "@/assets/elsa.png";
import annaImg from "@/assets/anna.png";

const FrozenIceQuest = () => {
  const [foundSnowflakes, setFoundSnowflakes] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const totalSnowflakes = 12;
  const positions = Array.from({ length: totalSnowflakes }, (_, i) => ({
    id: i,
    top: Math.random() * 70 + 10,
    left: Math.random() * 80 + 5,
  }));

  useEffect(() => {
    if (gameState !== "playing" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState("lost");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (foundSnowflakes.length === totalSnowflakes && gameState === "playing") {
      setGameState("won");
      setShowConfetti(true);
      setScore(prev => prev + 100 + timeLeft * 2);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [foundSnowflakes, gameState, timeLeft]);

  const handleSnowflakeClick = (id: number) => {
    if (!foundSnowflakes.includes(id) && gameState === "playing") {
      setFoundSnowflakes(prev => [...prev, id]);
      setScore(prev => prev + 10);
    }
  };

  const resetGame = () => {
    setFoundSnowflakes([]);
    setTimeLeft(60);
    setGameState("playing");
    setShowConfetti(false);
  };

  return (
    <GameLayout title="Frozen Ice Quest! ❄️">
      {showConfetti && <Confetti />}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src={elsaImg} alt="Elsa" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-3xl font-bold text-cyan-600">
                Find All Snowflakes!
              </h2>
              <p className="text-xl text-muted-foreground">
                Click them before they melt!
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              Score: <span className="text-primary">{score}</span>
            </div>
            <div className="flex items-center gap-2 text-xl">
              <Timer className="h-5 w-5 text-red-500" />
              <span className={timeLeft <= 10 ? "text-red-600 font-bold animate-pulse" : "text-muted-foreground"}>
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {gameState === "playing" && (
          <>
            <div className="mb-4 text-center">
              <p className="text-2xl font-bold text-cyan-600">
                Found: {foundSnowflakes.length} / {totalSnowflakes} ❄️
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 rounded-3xl border-4 border-cyan-400 p-4 h-[500px] overflow-hidden">
              {positions.map(pos => (
                <button
                  key={pos.id}
                  onClick={() => handleSnowflakeClick(pos.id)}
                  className={`absolute text-6xl transition-all duration-300 ${
                    foundSnowflakes.includes(pos.id)
                      ? "opacity-0 scale-0"
                      : "opacity-100 scale-100 hover:scale-125 animate-pulse"
                  }`}
                  style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                >
                  ❄️
                </button>
              ))}

              {foundSnowflakes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img src={annaImg} alt="Anna" className="w-32 h-32 opacity-50 object-contain" />
                </div>
              )}
            </div>
          </>
        )}

        {gameState === "won" && (
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">❄️</div>
            <h2 className="text-5xl font-bold text-cyan-600 mb-4">
              You Found Them All!
            </h2>
            <p className="text-3xl text-muted-foreground mb-6">
              The snowflakes are safe!
            </p>
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl border-4 border-cyan-400 p-8 mb-6">
              <p className="text-4xl font-bold text-cyan-600 mb-2">
                Final Score: {score}
              </p>
              <p className="text-2xl text-muted-foreground">
                Time Bonus: {timeLeft * 2} points!
              </p>
            </div>

            <Button onClick={resetGame} size="lg" className="text-2xl px-12 py-8">
              <RotateCcw className="mr-2 h-8 w-8" />
              Play Again
            </Button>
          </div>
        )}

        {gameState === "lost" && (
          <div className="text-center">
            <div className="text-8xl mb-4">⏰</div>
            <h2 className="text-5xl font-bold text-orange-600 mb-4">
              Time's Up!
            </h2>
            <p className="text-3xl text-muted-foreground mb-6">
              You found {foundSnowflakes.length} out of {totalSnowflakes} snowflakes!
            </p>
            <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl border-4 border-orange-400 p-8 mb-6">
              <p className="text-4xl font-bold text-orange-600">
                Score: {score}
              </p>
            </div>

            <Button onClick={resetGame} size="lg" className="text-2xl px-12 py-8">
              <RotateCcw className="mr-2 h-8 w-8" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default FrozenIceQuest;
