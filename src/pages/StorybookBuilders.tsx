import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, BookOpen } from "lucide-react";
import Confetti from "@/components/Confetti";

const StorybookBuilders = () => {
  const [story, setStory] = useState<string[]>([]);
  const [currentSentence, setCurrentSentence] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const addSentence = () => {
    if (currentSentence.trim()) {
      setStory([...story, currentSentence]);
      setCurrentSentence("");
      if ((story.length + 1) % 3 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  };

  return (
    <GameLayout title="Storybook Builders! 📖">
      {showConfetti && <Confetti />}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-4xl font-bold">Create Your Story!</h2>
        </div>

        {story.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border-4 border-yellow-400 p-8 mb-6">
            <h3 className="text-3xl font-bold mb-4">Your Story So Far:</h3>
            {story.map((sentence, i) => (
              <p key={i} className="text-2xl mb-3">
                <span className="text-purple-600 font-bold">{i + 1}.</span> {sentence}
              </p>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border-4 border-purple-300 p-6 mb-6">
          <label className="text-2xl font-bold mb-3 block">Add to the story:</label>
          <input
            type="text"
            value={currentSentence}
            onChange={(e) => setCurrentSentence(e.target.value)}
            placeholder="Once upon a time..."
            className="w-full p-4 text-xl rounded-2xl border-2 border-purple-200 mb-4"
            maxLength={100}
          />
          <div className="flex gap-4">
            <Button onClick={addSentence} disabled={!currentSentence.trim()} size="lg" className="flex-1">
              Add Sentence
            </Button>
            <Button onClick={() => { setStory([]); setCurrentSentence(""); }} variant="outline" size="lg">
              <RotateCcw className="mr-2" />
              New Story
            </Button>
          </div>
        </div>

        {story.length >= 5 && (
          <div className="text-center">
            <h3 className="text-4xl font-bold text-purple-600 mb-2">
              📚 Amazing Story! 📚
            </h3>
            <p className="text-2xl text-muted-foreground">
              Your story has {story.length} sentences!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default StorybookBuilders;
