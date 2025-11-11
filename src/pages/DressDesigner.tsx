import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";
import Confetti from "@/components/Confetti";
import belleImg from "@/assets/belle.png";
import elsaImg from "@/assets/elsa.png";
import arielImg from "@/assets/ariel.png";

const DressDesigner = () => {
  const characters = [
    { id: "belle", name: "Belle", image: belleImg },
    { id: "elsa", name: "Elsa", image: elsaImg },
    { id: "ariel", name: "Ariel", image: arielImg },
  ];

  const dressStyles = [
    { id: "ball", name: "Ball Gown", emoji: "👗" },
    { id: "casual", name: "Casual Dress", emoji: "👚" },
    { id: "elegant", name: "Elegant Gown", emoji: "💃" },
  ];

  const colors = [
    { name: "Pink", value: "#ec4899", emoji: "💗" },
    { name: "Blue", value: "#3b82f6", emoji: "💙" },
    { name: "Purple", value: "#a855f7", emoji: "💜" },
    { name: "Yellow", value: "#fbbf24", emoji: "💛" },
    { name: "Green", value: "#10b981", emoji: "💚" },
  ];

  const accessories = [
    { id: "crown", emoji: "👑", name: "Crown" },
    { id: "necklace", emoji: "📿", name: "Necklace" },
    { id: "flowers", emoji: "🌸", name: "Flowers" },
    { id: "gloves", emoji: "🧤", name: "Gloves" },
  ];

  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [selectedStyle, setSelectedStyle] = useState(dressStyles[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [designsCreated, setDesignsCreated] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleAccessory = (id: string) => {
    setSelectedAccessories(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const saveDesign = () => {
    setDesignsCreated(prev => prev + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const resetDesign = () => {
    setSelectedStyle(dressStyles[0]);
    setSelectedColor(colors[0]);
    setSelectedAccessories([]);
  };

  return (
    <GameLayout title="Dress Designer! 👗">
      {showConfetti && <Confetti />}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-pink-600">
            Create Beautiful Gowns!
          </h2>
          <div className="text-2xl font-bold">
            Designs: <span className="text-primary">{designsCreated}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Design Options */}
          <div className="space-y-6">
            {/* Character Selection */}
            <div>
              <h3 className="text-xl font-bold mb-3">Choose Character:</h3>
              <div className="flex gap-3">
                {characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className={`p-4 rounded-2xl border-4 transition-all ${
                      selectedCharacter.id === char.id
                        ? "bg-pink-500 border-pink-700 scale-110"
                        : "bg-white border-pink-300 hover:scale-105"
                    }`}
                  >
                    <img src={char.image} alt={char.name} className="w-16 h-16 object-contain" />
                    <p className="text-sm font-bold mt-2">{char.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dress Style */}
            <div>
              <h3 className="text-xl font-bold mb-3">Dress Style:</h3>
              <div className="flex gap-3">
                {dressStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-6 py-4 rounded-2xl border-4 text-4xl transition-all ${
                      selectedStyle.id === style.id
                        ? "bg-pink-500 border-pink-700 scale-110"
                        : "bg-white border-pink-300 hover:scale-105"
                    }`}
                  >
                    {style.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-xl font-bold mb-3">Color:</h3>
              <div className="flex gap-3 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-4 rounded-2xl border-4 text-4xl transition-all ${
                      selectedColor.name === color.name
                        ? "bg-purple-500 border-purple-700 scale-110"
                        : "bg-white border-purple-300 hover:scale-105"
                    }`}
                  >
                    {color.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <h3 className="text-xl font-bold mb-3">Accessories:</h3>
              <div className="grid grid-cols-2 gap-3">
                {accessories.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => toggleAccessory(acc.id)}
                    className={`p-4 rounded-2xl border-4 text-3xl transition-all ${
                      selectedAccessories.includes(acc.id)
                        ? "bg-yellow-500 border-yellow-700 scale-105"
                        : "bg-white border-yellow-300 hover:scale-105"
                    }`}
                  >
                    {acc.emoji} {acc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl border-4 border-pink-400 p-8">
            <h3 className="text-2xl font-bold text-center mb-6">Your Design:</h3>
            <div className="bg-white rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center">
              <img src={selectedCharacter.image} alt={selectedCharacter.name} className="w-32 h-32 object-contain mb-4" />
              <div className="text-8xl mb-4" style={{ filter: `hue-rotate(${colors.indexOf(selectedColor) * 60}deg)` }}>
                {selectedStyle.emoji}
              </div>
              <div className="flex gap-3 text-5xl mb-4">
                {selectedAccessories.map(accId => {
                  const acc = accessories.find(a => a.id === accId);
                  return acc ? <span key={accId}>{acc.emoji}</span> : null;
                })}
              </div>
              <p className="text-xl font-bold text-center">{selectedCharacter.name}'s {selectedColor.name} {selectedStyle.name}</p>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={saveDesign} size="lg" className="flex-1 text-xl">
                <Sparkles className="mr-2" />
                Save Design
              </Button>
              <Button onClick={resetDesign} size="lg" variant="outline" className="flex-1 text-xl">
                <RotateCcw className="mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {designsCreated >= 5 && (
          <div className="mt-6 text-center">
            <h3 className="text-4xl font-bold text-pink-600 mb-2">
              🎨 Master Designer! 🎨
            </h3>
            <p className="text-2xl text-muted-foreground">
              You've created {designsCreated} beautiful designs!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default DressDesigner;
