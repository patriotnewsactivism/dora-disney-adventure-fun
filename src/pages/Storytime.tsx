import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Book } from "lucide-react";
import Confetti from "@/components/Confetti";
import elsaImg from "@/assets/elsa.png";
import moanaImg from "@/assets/moana.png";
import arielImg from "@/assets/ariel.png";
import simbaImg from "@/assets/simba.png";

interface StoryNode {
  id: string;
  text: string;
  character: string;
  choices?: { text: string; next: string }[];
  isEnding?: boolean;
  endingType?: "good" | "great" | "bad";
}

const Storytime = () => {
  const characterImages: { [key: string]: string } = {
    elsa: elsaImg,
    moana: moanaImg,
    ariel: arielImg,
    simba: simbaImg,
  };

  const stories: { [key: string]: StoryNode } = {
    start: {
      id: "start",
      text: "Welcome to the Enchanted Forest! You're on a magical adventure. What do you want to do?",
      character: "elsa",
      choices: [
        { text: "Explore the mysterious castle", next: "castle" },
        { text: "Follow the singing birds", next: "birds" },
        { text: "Check out the sparkling lake", next: "lake" },
      ],
    },
    castle: {
      id: "castle",
      text: "You arrive at a beautiful castle! The doors are open. Inside, you see a grand ballroom with glittering chandeliers.",
      character: "elsa",
      choices: [
        { text: "Dance in the ballroom", next: "dance" },
        { text: "Explore the tower", next: "tower" },
      ],
    },
    birds: {
      id: "birds",
      text: "The birds lead you to a wonderful garden full of colorful flowers and friendly animals!",
      character: "moana",
      choices: [
        { text: "Plant a magic seed", next: "plant" },
        { text: "Make friends with animals", next: "animals" },
      ],
    },
    lake: {
      id: "lake",
      text: "You discover a beautiful lake with crystal clear water. Something is shimmering at the bottom!",
      character: "ariel",
      choices: [
        { text: "Dive to find the treasure", next: "treasure" },
        { text: "Build a sandcastle on shore", next: "sandcastle" },
      ],
    },
    dance: {
      id: "dance",
      text: "You dance and twirl! Suddenly, the room fills with magical sparkles and fairy lights. Everyone is amazed by your dancing!",
      character: "elsa",
      isEnding: true,
      endingType: "great",
    },
    tower: {
      id: "tower",
      text: "In the tower, you find a library full of magical books! Each book teaches you something wonderful. You become very wise!",
      character: "elsa",
      isEnding: true,
      endingType: "good",
    },
    plant: {
      id: "plant",
      text: "The magic seed grows into a giant rainbow tree! It gives fruit that makes everyone happy. You're a hero!",
      character: "moana",
      isEnding: true,
      endingType: "great",
    },
    animals: {
      id: "animals",
      text: "The animals teach you their secret language! Now you can talk to all creatures. How amazing!",
      character: "moana",
      isEnding: true,
      endingType: "good",
    },
    treasure: {
      id: "treasure",
      text: "You find a chest full of magical gems! The gems grant wishes to help everyone in the kingdom. You're celebrated as a hero!",
      character: "ariel",
      isEnding: true,
      endingType: "great",
    },
    sandcastle: {
      id: "sandcastle",
      text: "Your sandcastle is so beautiful that it becomes real! You now have your own magical beach palace!",
      character: "simba",
      isEnding: true,
      endingType: "good",
    },
  };

  const [currentNode, setCurrentNode] = useState(stories.start);
  const [storiesCompleted, setStoriesCompleted] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [storyPath, setStoryPath] = useState<string[]>(["start"]);

  const handleChoice = (nextId: string) => {
    const nextNode = stories[nextId];
    setCurrentNode(nextNode);
    setStoryPath(prev => [...prev, nextId]);

    if (nextNode.isEnding) {
      if (nextNode.endingType === "great" || nextNode.endingType === "good") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setStoriesCompleted(prev => prev + 1);
    }
  };

  const resetStory = () => {
    setCurrentNode(stories.start);
    setStoryPath(["start"]);
  };

  const getEndingMessage = () => {
    if (!currentNode.isEnding) return null;

    switch (currentNode.endingType) {
      case "great":
        return { emoji: "🏆", text: "Amazing Ending!", color: "text-yellow-600" };
      case "good":
        return { emoji: "⭐", text: "Great Ending!", color: "text-blue-600" };
      case "bad":
        return { emoji: "😊", text: "Try Again!", color: "text-purple-600" };
      default:
        return null;
    }
  };

  const ending = getEndingMessage();

  return (
    <GameLayout title="Interactive Storytime! 📚">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Book className="h-12 w-12 text-primary" />
            <div>
              <h2 className="text-3xl font-bold text-primary">
                Your Story Adventure
              </h2>
              <p className="text-xl text-muted-foreground">
                Make choices to shape your tale!
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold">
            Stories: <span className="text-primary">{storiesCompleted}</span>
          </div>
        </div>

        {/* Story Display */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl border-4 border-primary p-8 mb-8 shadow-xl">
          <div className="flex items-start gap-6 mb-6">
            <img
              src={characterImages[currentNode.character]}
              alt="Character"
              className="w-24 h-24 object-contain animate-bounce"
            />
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <p className="text-2xl leading-relaxed text-foreground">
                  {currentNode.text}
                </p>
              </div>
            </div>
          </div>

          {/* Ending Message */}
          {ending && (
            <div className="text-center mb-6">
              <div className={`text-6xl mb-2 animate-bounce`}>{ending.emoji}</div>
              <h3 className={`text-5xl font-bold ${ending.color} mb-4`}>
                {ending.text}
              </h3>
            </div>
          )}

          {/* Choices */}
          {currentNode.choices && (
            <div className="space-y-4">
              <p className="text-2xl font-bold text-center text-primary mb-4">
                What do you do?
              </p>
              {currentNode.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice.next)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold py-6 px-8 rounded-2xl border-4 border-blue-700 hover:scale-105 transition-transform shadow-lg"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress Path */}
        <div className="mb-6">
          <p className="text-lg text-muted-foreground text-center">
            Your Journey: {storyPath.length} steps taken
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <Button onClick={resetStory} size="lg" className="text-xl px-8 py-6">
            <RotateCcw className="mr-2 h-6 w-6" />
            New Story
          </Button>
        </div>

        {storiesCompleted >= 3 && (
          <div className="mt-8 text-center">
            <h3 className="text-4xl font-bold text-success mb-2">
              🏆 Master Storyteller! 🏆
            </h3>
            <p className="text-2xl text-muted-foreground">
              You've completed {storiesCompleted} adventures!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default Storytime;
