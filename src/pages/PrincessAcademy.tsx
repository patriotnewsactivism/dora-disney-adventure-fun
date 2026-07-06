import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Crown, Heart, Sparkles } from "lucide-react";
import Confetti from "@/components/Confetti";
import belleImg from "@/assets/belle.png";
import elsaImg from "@/assets/elsa.png";
import arielImg from "@/assets/ariel.png";

interface Challenge {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct: number;
  character: string;
}

const PrincessAcademy = () => {
  const characters: { [key: string]: string } = {
    belle: belleImg,
    elsa: elsaImg,
    ariel: arielImg,
  };

  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Grace & Manners",
      question: "What should you say when someone helps you?",
      options: ["Nothing", "Thank you!", "Go away", "I don't care"],
      correct: 1,
      character: "belle",
    },
    {
      id: "2",
      title: "Kindness",
      question: "A friend is sad. What do you do?",
      options: ["Ignore them", "Make fun of them", "Ask if they're okay", "Walk away"],
      correct: 2,
      character: "elsa",
    },
    {
      id: "3",
      title: "Bravery",
      question: "You see someone who needs help. What do you do?",
      options: ["Hide", "Help them!", "Pretend you didn't see", "Run away"],
      correct: 1,
      character: "ariel",
    },
    {
      id: "4",
      title: "Sharing",
      question: "You have cookies. Your friend doesn't. What do you do?",
      options: ["Eat them all alone", "Share your cookies", "Hide them", "Throw them away"],
      correct: 1,
      character: "belle",
    },
    {
      id: "5",
      title: "Honesty",
      question: "You accidentally break something. What do you do?",
      options: ["Blame someone else", "Hide it", "Tell the truth", "Run away"],
      correct: 2,
      character: "elsa",
    },
  ];

  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === challenges[currentChallenge].correct) {
      setScore(prev => prev + 1);

      setTimeout(() => {
        if (currentChallenge === challenges.length - 1) {
          setCompleted(true);
          setShowConfetti(true);
        } else {
          setCurrentChallenge(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
      }, 1500);
    }
  };

  const resetGame = () => {
    setCurrentChallenge(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCompleted(false);
    setShowConfetti(false);
  };

  const challenge = challenges[currentChallenge];

  return (
    <GameLayout title="Princess Academy! 👑">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        {!completed ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <Crown className="h-12 w-12 text-yellow-500" />
                <div>
                  <h2 className="text-3xl font-bold text-primary">
                    Princess Training
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Learn to be gracious and kind!
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                Score: <span className="text-primary">{score}/{challenges.length}</span>
              </div>
            </div>

            {/* Challenge Card */}
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl border-4 border-pink-400 p-8 mb-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={characters[challenge.character]}
                    alt="Princess"
                    className="w-20 h-20 object-contain"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      <h3 className="text-2xl font-bold text-pink-600">
                        {challenge.title}
                      </h3>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      Challenge {currentChallenge + 1} of {challenges.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-6">
                <p className="text-3xl font-bold text-center text-foreground">
                  {challenge.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenge.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                    className={`p-6 rounded-2xl border-4 text-xl font-bold transition-all ${
                      selectedAnswer === index && index === challenge.correct
                        ? "bg-green-500 text-white border-green-700 scale-105"
                        : selectedAnswer === index
                        ? "bg-red-500 text-white border-red-700"
                        : "bg-white border-pink-300 hover:scale-105 hover:border-pink-500"
                    } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {showResult && selectedAnswer === challenge.correct && (
                <div className="mt-6 text-center">
                  <p className="text-4xl font-bold text-success animate-bounce">
                    <Heart className="inline h-10 w-10" /> Perfect! <Heart className="inline h-10 w-10" />
                  </p>
                </div>
              )}

              {showResult && selectedAnswer !== challenge.correct && (
                <div className="mt-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    Try again! Think about kindness!
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="text-8xl mb-4 animate-bounce">👑</div>
              <h2 className="text-6xl font-bold text-pink-600 mb-4">
                Congratulations, Princess!
              </h2>
              <p className="text-3xl text-muted-foreground mb-6">
                You've completed Princess Academy!
              </p>
              <div className="bg-gradient-to-br from-yellow-100 to-pink-100 rounded-3xl border-4 border-yellow-400 p-8 mb-6">
                <p className="text-4xl font-bold text-pink-600 mb-4">
                  Final Score: {score} out of {challenges.length}
                </p>
                <div className="flex justify-center gap-4 text-5xl">
                  <Crown className="h-16 w-16 text-yellow-500" />
                  <Sparkles className="h-16 w-16 text-pink-500" />
                  <Heart className="h-16 w-16 text-red-500" />
                </div>
              </div>
              <p className="text-2xl text-muted-foreground">
                You've learned grace, kindness, bravery, sharing, and honesty!
              </p>
            </div>

            <div className="flex justify-center">
              <Button onClick={resetGame} size="lg" className="text-2xl px-12 py-8">
                <RotateCcw className="mr-2 h-8 w-8" />
                Train Again
              </Button>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
};

export default PrincessAcademy;
