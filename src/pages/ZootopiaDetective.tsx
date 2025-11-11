import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Search } from "lucide-react";
import Confetti from "@/components/Confetti";

const ZootopiaDetective = () => {
  const cases = [
    {
      id: 1,
      mystery: "Who ate the missing donut?",
      clues: ["Chocolate fingerprints", "Small paw prints", "Empty milk carton"],
      suspects: ["Officer Clawhauser (loves donuts)", "Chief Bogo (too busy)", "Judy Hopps (on patrol)"],
      correct: 0,
    },
    {
      id: 2,
      mystery: "Where did the missing carrots go?",
      clues: ["Trail of orange crumbs", "Bunny fur nearby", "Garden gate open"],
      suspects: ["Nick Wilde (doesn't eat carrots)", "Judy Hopps (loves carrots)", "Flash (too slow)"],
      correct: 1,
    },
    {
      id: 3,
      mystery: "Who left muddy tracks in the station?",
      clues: ["Large footprints", "Wet fur traces", "Open window"],
      suspects: ["Chief Bogo (was inside)", "Mr. Big (too small)", "Officer McHorn (just arrived from patrol)"],
      correct: 2,
    },
  ];

  const [currentCase, setCurrentCase] = useState(0);
  const [casesSolved, setCasesSolved] = useState(0);
  const [showClues, setShowClues] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const case_data = cases[currentCase];

  const handleSuspectSelect = (index: number) => {
    setSelectedSuspect(index);
    setShowResult(true);

    if (index === case_data.correct) {
      setCasesSolved(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        if (currentCase < cases.length - 1) {
          nextCase();
        }
      }, 2500);
    } else {
      setTimeout(() => {
        setSelectedSuspect(null);
        setShowResult(false);
      }, 1500);
    }
  };

  const nextCase = () => {
    setCurrentCase(prev => (prev + 1) % cases.length);
    setShowClues(false);
    setSelectedSuspect(null);
    setShowResult(false);
  };

  const resetGame = () => {
    setCurrentCase(0);
    setCasesSolved(0);
    setShowClues(false);
    setSelectedSuspect(null);
    setShowResult(false);
    setShowConfetti(false);
  };

  return (
    <GameLayout title="Zootopia Detective! 🔍">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Search className="h-12 w-12 text-orange-500" />
            <div>
              <h2 className="text-3xl font-bold text-orange-600">
                Solve the Mystery!
              </h2>
              <p className="text-xl text-muted-foreground">
                Examine clues and find the culprit
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold">
            Solved: <span className="text-primary">{casesSolved}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl border-4 border-orange-400 p-8 mb-6">
          <div className="text-7xl text-center mb-4">🕵️</div>
          <h3 className="text-3xl font-bold text-center text-orange-700 mb-6">
            Case #{currentCase + 1}: {case_data.mystery}
          </h3>

          {!showClues ? (
            <div className="text-center">
              <Button onClick={() => setShowClues(true)} size="lg" className="text-2xl px-12 py-8 bg-orange-600">
                <Search className="mr-2 h-8 w-8" />
                Investigate Clues
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-6 mb-6">
                <h4 className="text-2xl font-bold mb-4 text-orange-700">Clues Found:</h4>
                <ul className="space-y-3">
                  {case_data.clues.map((clue, index) => (
                    <li key={index} className="text-xl flex items-start gap-3">
                      <span className="text-3xl">🔎</span>
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold mb-4 text-orange-700">Suspects:</h4>
                <div className="grid grid-cols-1 gap-4">
                  {case_data.suspects.map((suspect, index) => (
                    <button
                      key={index}
                      onClick={() => !showResult && handleSuspectSelect(index)}
                      disabled={showResult}
                      className={`p-6 rounded-2xl border-4 text-xl font-bold transition-all ${
                        selectedSuspect === index && index === case_data.correct
                          ? "bg-green-500 text-white border-green-700 scale-105"
                          : selectedSuspect === index
                          ? "bg-red-500 text-white border-red-700"
                          : "bg-white border-orange-300 hover:scale-105 hover:border-orange-500"
                      } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {suspect}
                    </button>
                  ))}
                </div>
              </div>

              {showResult && selectedSuspect === case_data.correct && (
                <div className="mt-6 text-center">
                  <p className="text-4xl font-bold text-success animate-bounce">
                    🎉 Case Solved! 🎉
                  </p>
                </div>
              )}

              {showResult && selectedSuspect !== case_data.correct && (
                <div className="mt-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    Not quite! Check the clues again!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          {currentCase < cases.length - 1 && casesSolved > 0 && (
            <Button onClick={nextCase} size="lg" className="text-xl px-8 py-6 bg-orange-600">
              Next Case
            </Button>
          )}
          <Button onClick={resetGame} size="lg" variant="outline" className="text-xl px-8 py-6">
            <RotateCcw className="mr-2 h-6 w-6" />
            Reset
          </Button>
        </div>

        {casesSolved === cases.length && (
          <div className="mt-8 text-center">
            <h3 className="text-5xl font-bold text-orange-600 mb-2">
              🏆 Master Detective! 🏆
            </h3>
            <p className="text-3xl text-muted-foreground">
              You solved all {casesSolved} cases!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default ZootopiaDetective;
