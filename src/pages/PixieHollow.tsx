import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";
import Confetti from "@/components/Confetti";
import rapunzelImg from "@/assets/rapunzel.png";

const PixieHollow = () => {
  const talents = [
    { id: "light", name: "Light Fairy", emoji: "â¨", color: "bg-yellow-400" },
    { id: "garden", name: "Garden Fairy", emoji: "ð¸", color: "bg-green-400" },
    { id: "animal", name: "Animal Fairy", emoji: "ð¦", color: "bg-blue-400" },
    { id: "water", name: "Water Fairy", emoji: "ð§", color: "bg-cyan-400" },
  ];

  const challenges = [
    { question: "What do flowers need to grow?", options: ["Darkness", "Sunlight & Water", "Ice", "Fire"], correct: 1, talent: "garden" },
    { question: "What do butterflies start as?", options: ["Birds", "Caterpillars", "Frogs", "Fish"], correct: 1, talent: "animal" },
    { question: "What makes rainbows appear?", options: ["Clouds", "Sunlight & Rain", "Snow", "Wind"], correct: 1, talent: "light" },
    { question: "Where do fish live?", options: ["Trees", "Caves", "Water", "Sky"], correct: 2, talent: "water" },
  ];

  const [selectedTalent, setSelectedTalent] = useState<typeof talents[0] | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameState, setGameState] = useState<"select" | "play" | "complete">("select");
  const [fairyDust, setFairyDust] = useState(0);

  const handleTalentSelect = (talent: typeof talents[0]) => {
    setSelectedTalent(talent);
    setGameState("play");
  };

  const handleAnswer = (index: number) => {
    if (index === challenges[currentChallenge].correct) {
      setScore(prev => prev + 1);
      setFairyDust(prev => prev + 10);

      if (currentChallenge === challenges.length - 1) {
        setGameState("complete");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setCurrentChallenge(prev => prev + 1);
      }
    }
  };

  const resetGame = () => {
    setSelectedTalent(null);
    setCurrentChallenge(0);
    setScore(0);
    setFairyDust(0);
    setGameState("select");
    setShowConfetti(false);
  };

  return (
    <GameLayout title="Pixie Hollow Adventures! ð§">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        {gameState === "select" && (
          <div>
            <div className="text-center mb-8">
              <img src={rapunzelImg} alt="Fairy" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h2 className="text-4xl font-bold text-primary mb-4">
                Choose Your Fairy Talent!
              </h2>
              <p className="text-2xl text-muted-foreground">
                Every fairy has a special gift!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {talents.map(talent => (
                <button
                  key={talent.id}
                  onClick={() => handleTalentSelect(talent)}
                  className={`${talent.color} p-8 rounded-3xl border-4 border-white hover:scale-105 transition-transform shadow-xl`}
                >
                  <div className="text-7xl mb-4">{talent.emoji}</div>
                  <h3 className="text-3xl font-bold text-white">{talent.name}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "play" && selectedTalent && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className={`${selectedTalent.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                  {selectedTalent.emoji}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedTalent.name}</h2>
                  <p className="text-lg text-muted-foreground">Challenge {currentChallenge + 1}/{challenges.length}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">Score: {score}</div>
                <div className="text-xl text-yellow-600 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {fairyDust} Dust
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl border-4 border-purple-400 p-8 mb-6">
              <p className="text-3xl font-bold text-center mb-6">
                {challenges[currentChallenge].question}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges[currentChallenge].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="bg-white p-6 rounded-2xl border-4 border-purple-300 text-2xl font-bold hover:scale-105 transition-transform hover:border-purple-500"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === "complete" && selectedTalent && (
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">{selectedTalent.emoji}</div>
            <h2 className="text-5xl font-bold text-primary mb-4">
              Congratulations, Fairy!
            </h2>
            <p className="text-3xl text-muted-foreground mb-6">
              You've mastered {selectedTalent.name} challenges!
            </p>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl border-4 border-yellow-400 p-8 mb-6">
              <p className="text-4xl font-bold mb-4">
                Final Score: {score}/{challenges.length}
              </p>
              <div className="flex items-center justify-center gap-2 text-3xl text-yellow-600">
                <Sparkles className="h-10 w-10" />
                <span>Collected {fairyDust} Fairy Dust!</span>
                <Sparkles className="h-10 w-10" />
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

export default PixieHollow;
