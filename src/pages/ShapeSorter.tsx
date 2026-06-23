import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Confetti from "@/components/Confetti";
import mickeyImg from "@/assets/mickey.png";
import minnieImg from "@/assets/minnie.png";

interface Shape {
  id: string;
  type: string;
  color: string;
  emoji: string;
}

const ShapeSorter = () => {
  const shapes: Shape[] = [
    { id: "circle", type: "circle", color: "#ef4444", emoji: "ð´" },
    { id: "square", type: "square", color: "#3b82f6", emoji: "ð¦" },
    { id: "triangle", type: "triangle", color: "#22c55e", emoji: "ðº" },
    { id: "star", type: "star", color: "#eab308", emoji: "â­" },
  ];

  const [draggingShape, setDraggingShape] = useState<Shape | null>(null);
  const [placedShapes, setPlacedShapes] = useState<{ [key: string]: boolean }>({});
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [level, setLevel] = useState(1);

  const handleDragStart = (shape: Shape) => {
    setDraggingShape(shape);
  };

  const handleDrop = (targetShape: Shape) => {
    if (draggingShape && draggingShape.id === targetShape.id) {
      setPlacedShapes(prev => ({ ...prev, [targetShape.id]: true }));
      setScore(prev => prev + 1);

      // Check if all shapes are placed
      const newPlaced = { ...placedShapes, [targetShape.id]: true };
      if (Object.keys(newPlaced).length === shapes.length) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          nextLevel();
        }, 2500);
      }
    }
    setDraggingShape(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setPlacedShapes({});
  };

  const resetGame = () => {
    setPlacedShapes({});
    setScore(0);
    setLevel(1);
    setShowConfetti(false);
  };

  return (
    <GameLayout title="Shape Sorter! ð·">
      {showConfetti && <Confetti />}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img src={mickeyImg} alt="Mickey" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-3xl font-bold text-primary">
                Sort the Shapes!
              </h2>
              <p className="text-xl text-muted-foreground">
                Drag shapes to their matching spots
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              Score: <span className="text-primary">{score}</span>
            </div>
            <div className="text-xl text-muted-foreground">
              Level: {level}
            </div>
          </div>
        </div>

        {/* Drop Targets */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-6">Match the Shapes Here:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {shapes.map(shape => (
              <div
                key={`target-${shape.id}`}
                className="aspect-square rounded-3xl border-4 border-dashed border-primary bg-gradient-to-br from-muted to-background flex items-center justify-center relative"
                onDrop={() => handleDrop(shape)}
                onDragOver={handleDragOver}
              >
                {/* Outline of shape */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  {shape.type === "circle" && (
                    <div className="w-32 h-32 rounded-full border-8 border-gray-400"></div>
                  )}
                  {shape.type === "square" && (
                    <div className="w-32 h-32 border-8 border-gray-400"></div>
                  )}
                  {shape.type === "triangle" && (
                    <div className="text-9xl text-gray-400">â³</div>
                  )}
                  {shape.type === "star" && (
                    <div className="text-9xl text-gray-400">â</div>
                  )}
                </div>

                {/* Placed shape */}
                {placedShapes[shape.id] && (
                  <div className="text-9xl animate-bounce z-10">
                    {shape.emoji}
                  </div>
                )}

                {!placedShapes[shape.id] && (
                  <p className="text-xl font-bold text-muted-foreground capitalize z-10">
                    {shape.type}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Draggable Shapes */}
        {Object.keys(placedShapes).length < shapes.length && (
          <div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src={minnieImg} alt="Minnie" className="w-12 h-12 object-contain" />
              <h3 className="text-2xl font-bold">Drag from here:</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {shapes.filter(shape => !placedShapes[shape.id]).map(shape => (
                <div
                  key={`drag-${shape.id}`}
                  draggable
                  onDragStart={() => handleDragStart(shape)}
                  className="aspect-square rounded-3xl border-4 border-primary bg-white flex items-center justify-center cursor-move hover:scale-105 transition-transform shadow-lg"
                  style={{ touchAction: "none" }}
                >
                  <div className="text-9xl">
                    {shape.emoji}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {Object.keys(placedShapes).length === shapes.length && (
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-success animate-bounce mb-4">
              ð Perfect Match! ð
            </p>
            <p className="text-2xl text-muted-foreground">
              All shapes sorted correctly!
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 justify-center mt-8">
          <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
            <RotateCcw className="mr-2 h-6 w-6" />
            New Game
          </Button>
        </div>

        {score >= 10 && (
          <div className="mt-6 text-center">
            <h3 className="text-4xl font-bold text-success mb-2">
              ð Shape Master! ð
            </h3>
            <p className="text-2xl text-muted-foreground">
              You've sorted {score} shapes!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default ShapeSorter;
