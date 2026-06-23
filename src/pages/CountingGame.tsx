import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";
import mickeyImg from "@/assets/mickey.png";
import minnieImg from "@/assets/minnie.png";
import elsaImg from "@/assets/elsa.png";
import annaImg from "@/assets/anna.png";

const CountingGame = () => {
  const [targetNumber, setTargetNumber] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  const characters = [mickeyImg, minnieImg, elsaImg, annaImg];
  const emojis = ["ð", "ð", "ð", "ð§", "ð", "ðº"];

  const [currentCharacter, setCurrentCharacter] = useState(characters[0]);
  const [currentEmoji, setCurrentEmoji] = useState(emojis[0]);

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    const maxCount = Math.min(3 + Math.floor(round / 3), 10);
    const newTarget = Math.floor(Math.random() * (maxCount - 1)) + 2;
    setTargetNumber(newTarget);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentCharacter(characters[Math.floor(Math.random() * characters.length)]);
    setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  };

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer);

    if (answer === targetNumber) {
      setIsCorrect(true);
      setScore(prev => prev + 1);

      if ((score + 1) % 5 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setTimeout(() => {
        setRound(prev => prev + 1);
        generateQuestion();
      }, 1500);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedAnswer(null);
      }, 1000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setShowConfetti(false);
    generateQuestion();
  };

  const answerOptions = [
    targetNumber - 1,
    targetNumber,
    targetNumber + 1,
  ].filter(n => n > 0).sort(() => Math.random() - 0.5);

  // Ensure target is in options
  if (!answerOptions.includes(targetNumber)) {
    answerOptions[1] = targetNumber;
  }

  return (
    <GameLayout title="Counting Fun! ð¢">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Count the Objects!
          </h2>
          <p className="text-xl text-muted-foreground">
            How many do you see?
          </p>
        </div>

        <div className="flex justify-between items-center mb-8 px-4">
          <div className="text-2xl font-bold">
            Score: <span className="text-primary">{score}</span>
          </div>
          <div className="text-2xl font-bold">
            Round: <span className="text-accent">{round}</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="mb-10 p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl border-4 border-primary">
          <div className="flex items-center gap-4 mb-6">
            <img src={currentCharacter} alt="Character" className="w-20 h-20 object-contain" />
            <p className="text-3xl font-bold text-foreground">
              Count the {currentEmoji}!
            </p>
          </div>

          {/* Objects to Count */}
          <div className="flex flex-wrap justify-center gap-6 p-8 bg-white rounded-2xl">
            {Array.from({ length: targetNumber }).map((_, i) => (
              <div
                key={i}
                className="text-7xl animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {currentEmoji}
              </div>
            ))}
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
          {answerOptions.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={isCorrect !== null}
              className={cn(
                "aspect-square rounded-3xl border-4 text-6xl font-bold transition-all duration-200",
                selectedAnswer === option && isCorrect === true && "bg-green-500 text-white border-green-700 scale-110 shadow-2xl",
                selectedAnswer === option && isCorrect === false && "bg-red-500 text-white border-red-700 shake",
                selectedAnswer !== option && "bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-800 hover:scale-105",
                isCorrect !== null && "cursor-not-allowed"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Feedback */}
        <div className="text-center space-y-4">
          {isCorrect === true && (
            <p className="text-4xl font-bold text-success animate-bounce">
              â­ Correct! Great job! â­
            </p>
          )}

          {isCorrect === false && (
            <p className="text-3xl font-bold text-destructive animate-pulse">
              Try again! Count carefully!
            </p>
          )}

          {score >= 10 && (
            <div className="mb-4">
              <h2 className="text-5xl font-bold text-success mb-2">
                ð Amazing Counter! ð
              </h2>
              <p className="text-2xl text-muted-foreground">
                You've counted {score} correctly!
              </p>
            </div>
          )}

          <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
            <RotateCcw className="mr-2 h-6 w-6" />
            New Game
          </Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default CountingGame;
