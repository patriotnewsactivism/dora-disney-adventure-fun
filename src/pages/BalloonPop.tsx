import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  type: string;
  emoji: string;
  speed: number;
}

const BalloonPop = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const balloonTypes = [
    { type: "normal", emoji: "ð", color: "text-red-500", points: 1 },
    { type: "normal", emoji: "ð", color: "text-blue-500", points: 1 },
    { type: "normal", emoji: "ð", color: "text-green-500", points: 1 },
    { type: "normal", emoji: "ð", color: "text-yellow-500", points: 1 },
    { type: "special", emoji: "â­", color: "text-yellow-400", points: 5 },
    { type: "heart", emoji: "â¤ï¸", color: "text-pink-500", points: 3 },
  ];

  useEffect(() => {
    // Spawn balloons
    const interval = setInterval(() => {
      if (balloons.length < 15) {
        const randomType = balloonTypes[Math.floor(Math.random() * balloonTypes.length)];
        const newBalloon: Balloon = {
          id: Date.now() + Math.random(),
          x: Math.random() * 90 + 5,
          y: 100,
          color: randomType.color,
          type: randomType.type,
          emoji: randomType.emoji,
          speed: 0.3 + Math.random() * 0.5,
        };
        setBalloons(prev => [...prev, newBalloon]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [balloons.length]);

  useEffect(() => {
    // Move balloons up
    const interval = setInterval(() => {
      setBalloons(prev =>
        prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -10)
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const popBalloon = (id: number) => {
    const balloon = balloons.find(b => b.id === id);
    if (!balloon) return;

    const pointsMap = {
      "ð": 1,
      "â­": 5,
      "â¤ï¸": 3,
    };

    const points = pointsMap[balloon.emoji as keyof typeof pointsMap] || 1;
    setScore(prev => prev + points);

    setBalloons(prev => prev.filter(b => b.id !== id));

    if (score + points >= 50 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const resetGame = () => {
    setBalloons([]);
    setScore(0);
    setShowConfetti(false);
  };

  return (
    <GameLayout title="Balloon Pop! ð">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Pop the Balloons!
          </h2>
          <p className="text-xl text-muted-foreground">
            ð = 1 point | â¤ï¸ = 3 points | â­ = 5 points
          </p>
        </div>

        <div className="mb-6 text-center">
          <div className="text-4xl font-bold">
            Score: <span className="text-primary">{score}</span>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative h-[600px] bg-gradient-to-b from-sky-200 to-sky-400 rounded-2xl border-4 border-primary overflow-hidden">
          {/* Clouds */}
          <div className="absolute top-4 left-1/4 text-6xl opacity-70">âï¸</div>
          <div className="absolute top-20 right-1/4 text-6xl opacity-70">âï¸</div>
          <div className="absolute top-40 left-1/2 text-6xl opacity-70">âï¸</div>

          {/* Balloons */}
          {balloons.map(balloon => (
            <button
              key={balloon.id}
              onClick={() => popBalloon(balloon.id)}
              className="absolute transition-all duration-100 hover:scale-125 active:scale-75 cursor-pointer"
              style={{
                left: `${balloon.x}%`,
                top: `${balloon.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className={`text-7xl ${balloon.color} drop-shadow-lg`}>
                {balloon.emoji}
              </span>
            </button>
          ))}

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-600" />
          <div className="absolute bottom-16 left-0 right-0 h-4 bg-green-700" />
        </div>

        {/* Controls */}
        <div className="text-center mt-6 space-y-4">
          {score >= 100 && (
            <div className="animate-bounce">
              <h2 className="text-5xl font-bold text-success mb-2">
                ð Amazing! ð
              </h2>
              <p className="text-2xl text-muted-foreground">
                You popped {score} points worth of balloons!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
              <RotateCcw className="mr-2 h-6 w-6" />
              Reset
            </Button>
          </div>

          <p className="text-lg text-muted-foreground">
            Balloons: {balloons.length} | Total Popped: {score}
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default BalloonPop;
