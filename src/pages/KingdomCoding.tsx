import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Code } from "lucide-react";
import Confetti from "@/components/Confetti";

const KingdomCoding = () => {
  const challenges = [
    { id: 1, task: "Move the hero to the castle", start: 0, goal: 5, solution: ["→", "→", "→", "→", "→"] },
    { id: 2, task: "Move right 3, then left 1", start: 0, goal: 2, solution: ["→", "→", "→", "←"] },
  ];

  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [commands, setCommands] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const challenge = challenges[currentChallenge];

  const addCommand = (cmd: string) => {
    setCommands([...commands, cmd]);
  };

  const runCode = () => {
    let pos = challenge.start;
    commands.forEach(cmd => {
      if (cmd === "→") pos++;
      if (cmd === "←") pos--;
    });

    setPosition(pos);

    if (pos === challenge.goal) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentChallenge((currentChallenge + 1) % challenges.length);
        setCommands([]);
        setPosition(0);
      }, 2000);
    }
  };

  return (
    <GameLayout title="Kingdom Coding! 💻">
      {showConfetti && <Confetti />}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <Code className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-3xl font-bold">{challenge.task}</h2>
          <p className="text-xl mt-2">Challenges Solved: {score}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl border-4 border-blue-400 p-8 mb-6">
          <div className="flex justify-around text-6xl mb-4">
            {Array(7).fill(0).map((_, i) => (
              <div key={i}>
                {i === position ? "🦸" : i === challenge.goal ? "🏰" : "⬜"}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-4 border-blue-300 p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4">Your Code:</h3>
          <div className="flex flex-wrap gap-2 mb-4 min-h-[60px] bg-gray-100 p-4 rounded-xl">
            {commands.map((cmd, i) => (
              <span key={i} className="text-3xl bg-blue-200 px-4 py-2 rounded-lg">{cmd}</span>
            ))}
          </div>

          <div className="flex gap-4 mb-4">
            <Button onClick={() => addCommand("→")} size="lg" className="flex-1 text-2xl">
              Move Right →
            </Button>
            <Button onClick={() => addCommand("←")} size="lg" className="flex-1 text-2xl">
              Move Left ←
            </Button>
          </div>

          <div className="flex gap-4">
            <Button onClick={runCode} disabled={commands.length === 0} size="lg" className="flex-1 bg-green-600">
              ▶️ Run Code
            </Button>
            <Button onClick={() => { setCommands([]); setPosition(challenge.start); }} variant="outline" size="lg">
              <RotateCcw className="mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default KingdomCoding;
