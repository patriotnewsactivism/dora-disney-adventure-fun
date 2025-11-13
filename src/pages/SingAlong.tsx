import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Music } from "lucide-react";
import Confetti from "@/components/Confetti";

const SingAlong = () => {
  const songs = [
    { title: "Let It Go", emoji: "❄️", lyrics: ["Let it go, let it go!", "Can't hold it back anymore!"] },
    { title: "Under the Sea", emoji: "🐠", lyrics: ["Under the sea!", "Darling it's better, down where it's wetter!"] },
    { title: "A Whole New World", emoji: "🧞", lyrics: ["A whole new world!", "A new fantastic point of view!"] },
  ];

  const [currentSong, setCurrentSong] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const performSong = () => {
    setScore(prev => prev + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const nextSong = () => setCurrentSong((prev) => (prev + 1) % songs.length);

  return (
    <GameLayout title="Sing-Along! 🎤">
      {showConfetti && <Confetti />}
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-8xl mb-4">{songs[currentSong].emoji}</div>
        <h2 className="text-4xl font-bold mb-4">{songs[currentSong].title}</h2>
        {songs[currentSong].lyrics.map((line, i) => (
          <p key={i} className="text-2xl mb-2">🎵 {line}</p>
        ))}
        <div className="flex gap-4 justify-center mt-8">
          <Button onClick={performSong} size="lg"><Music className="mr-2" />Sing!</Button>
          <Button onClick={nextSong} size="lg" variant="outline">Next Song</Button>
        </div>
        <p className="mt-4 text-xl">Songs Performed: {score}</p>
      </div>
    </GameLayout>
  );
};

export default SingAlong;
