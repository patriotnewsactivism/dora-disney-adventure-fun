import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/Confetti";

const MoanaRhythm = () => {
  const drums = ["ð¥", "ðª", "ðµ", "ð¶"];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const startGame = () => {
    const newSeq = [Math.floor(Math.random() * 4)];
    setSequence(newSeq);
    setPlayerSequence([]);
  };

  const handleDrumClick = (index: number) => {
    const newPlayer = [...playerSequence, index];
    setPlayerSequence(newPlayer);

    if (newPlayer[newPlayer.length - 1] !== sequence[newPlayer.length - 1]) {
      alert("Wrong! Try again!");
      setPlayerSequence([]);
      return;
    }

    if (newPlayer.length === sequence.length) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setSequence([...sequence, Math.floor(Math.random() * 4)]);
        setPlayerSequence([]);
      }, 1500);
    }
  };

  return (
    <GameLayout title="Moana's Rhythm! ð¥">
      {showConfetti && <Confetti />}
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-8xl mb-4">ðº</div>
        <h2 className="text-3xl mb-6">Repeat the Rhythm!</h2>
        {sequence.length === 0 ? (
          <Button onClick={startGame} size="lg">Start Game</Button>
        ) : (
          <>
            <div className="mb-6 text-6xl">{sequence.map((i, idx) => <span key={idx}>{drums[i]}</span>)}</div>
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
              {drums.map((drum, i) => (
                <button key={i} onClick={() => handleDrumClick(i)} className="text-7xl p-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl hover:scale-110 transition-all border-4 border-yellow-600">
                  {drum}
                </button>
              ))}
            </div>
            <p className="text-2xl">Level: {score + 1}</p>
          </>
        )}
      </div>
    </GameLayout>
  );
};

export default MoanaRhythm;
