import { useState, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, Castle } from "lucide-react";
import Confetti from "@/components/Confetti";
import belleImg from "@/assets/belle.png";

const BuildKingdom = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState("#8b5cf6");
  const [currentTool, setCurrentTool] = useState<"castle" | "tower" | "flag" | "tree" | "cloud">("castle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const colors = [
    { name: "Purple", value: "#8b5cf6" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Green", value: "#10b981" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Red", value: "#ef4444" },
  ];

  const tools = [
    { id: "castle", emoji: "🏰", name: "Castle" },
    { id: "tower", emoji: "🗼", name: "Tower" },
    { id: "flag", emoji: "🚩", name: "Flag" },
    { id: "tree", emoji: "🌳", name: "Tree" },
    { id: "cloud", emoji: "☁️", name: "Cloud" },
  ];

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = "60px Arial";
    const tool = tools.find(t => t.id === currentTool);
    if (tool) {
      ctx.fillText(tool.emoji, x - 30, y + 30);
      setScore(prev => prev + 1);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawOnCanvas(e);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw sky background
    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    // Draw ground
    ctx.fillStyle = "#86efac";
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    setScore(0);
  };

  const saveKingdom = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Initialize canvas
  if (canvasRef.current) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx && score === 0) {
      ctx.fillStyle = "#93c5fd";
      ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
      ctx.fillStyle = "#86efac";
      ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    }
  }

  return (
    <GameLayout title="Build a Kingdom! 🏰">
      {showConfetti && <Confetti />}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src={belleImg} alt="Belle" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-3xl font-bold text-purple-600">
                Design Your Kingdom!
              </h2>
              <p className="text-xl text-muted-foreground">
                Click to add buildings and decorations
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              Items: <span className="text-primary">{score}</span>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-3">Choose Your Tool:</h3>
          <div className="flex gap-3 flex-wrap">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id as typeof currentTool)}
                className={`px-6 py-3 rounded-2xl border-4 text-2xl font-bold transition-all ${
                  currentTool === tool.id
                    ? "bg-purple-500 text-white border-purple-700 scale-110"
                    : "bg-white border-purple-300 hover:scale-105"
                }`}
              >
                {tool.emoji} {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="mb-6 border-4 border-purple-400 rounded-3xl overflow-hidden shadow-xl">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full cursor-crosshair bg-gradient-to-b from-sky-200 to-green-200"
            onClick={handleCanvasClick}
            onMouseEnter={() => setIsDrawing(true)}
            onMouseLeave={() => setIsDrawing(false)}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={saveKingdom} size="lg" className="text-xl px-8 py-6 bg-purple-600">
            <Save className="mr-2 h-6 w-6" />
            Save Kingdom
          </Button>

          <Button onClick={clearCanvas} size="lg" variant="outline" className="text-xl px-8 py-6">
            <RotateCcw className="mr-2 h-6 w-6" />
            Start Over
          </Button>
        </div>

        {score >= 10 && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Castle className="h-10 w-10 text-purple-600" />
              <h3 className="text-4xl font-bold text-purple-600">
                Beautiful Kingdom!
              </h3>
              <Castle className="h-10 w-10 text-purple-600" />
            </div>
            <p className="text-2xl text-muted-foreground">
              You've added {score} items to your kingdom!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default BuildKingdom;
