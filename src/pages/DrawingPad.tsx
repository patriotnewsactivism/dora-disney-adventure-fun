import { useRef, useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Eraser, Download, RotateCcw, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import mickeyImg from "@/assets/mickey.png";
import elsaImg from "@/assets/elsa.png";
import moanaImg from "@/assets/moana.png";

const DrawingPad = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#FF0000");
  const [brushSize, setBrushSize] = useState(5);
  const [showStamps, setShowStamps] = useState(false);

  const colors = [
    "#FF0000", "#FF7F00", "#FFFF00", "#00FF00",
    "#0000FF", "#4B0082", "#9400D3", "#FF1493",
    "#000000", "#FFFFFF", "#8B4513", "#FFD700",
  ];

  const stamps = [
    { image: mickeyImg, name: "Mickey" },
    { image: elsaImg, name: "Elsa" },
    { image: moanaImg, name: "Moana" },
    { emoji: "⭐", name: "Star" },
    { emoji: "❤️", name: "Heart" },
    { emoji: "🌈", name: "Rainbow" },
    { emoji: "🌸", name: "Flower" },
    { emoji: "🦋", name: "Butterfly" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const addStamp = (stamp: typeof stamps[0], e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (stamp.image) {
      const img = new Image();
      img.src = stamp.image;
      img.onload = () => {
        ctx.drawImage(img, x - 40, y - 40, 80, 80);
      };
    } else if (stamp.emoji) {
      ctx.font = "60px Arial";
      ctx.fillText(stamp.emoji, x - 30, y + 20);
    }

    setShowStamps(false);
  };

  return (
    <GameLayout title="Drawing Pad! 🎨">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Create Your Masterpiece!
          </h2>
          <p className="text-xl text-muted-foreground">
            Draw, color, and add stickers!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <div className="space-y-6">
            {/* Colors */}
            <div className="bg-white p-4 rounded-2xl border-4 border-primary">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="h-6 w-6" />
                Colors
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-full border-4 transition-transform",
                      currentColor === color ? "border-black scale-110" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div className="bg-white p-4 rounded-2xl border-4 border-primary">
              <h3 className="text-xl font-bold mb-4">Brush Size</h3>
              <input
                type="range"
                min="1"
                max="30"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center mt-2 text-lg font-semibold">
                {brushSize}px
              </div>
              <div
                className="mx-auto mt-2 rounded-full"
                style={{
                  width: `${brushSize * 2}px`,
                  height: `${brushSize * 2}px`,
                  backgroundColor: currentColor,
                }}
              />
            </div>

            {/* Stamps */}
            <div className="bg-white p-4 rounded-2xl border-4 border-primary">
              <Button
                onClick={() => setShowStamps(!showStamps)}
                className="w-full text-lg"
                variant={showStamps ? "default" : "outline"}
              >
                ✨ Stamps & Stickers
              </Button>
              {showStamps && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {stamps.map((stamp, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-semibold"
                    >
                      {stamp.image ? (
                        <img
                          src={stamp.image}
                          alt={stamp.name}
                          className="w-12 h-12 object-contain mx-auto cursor-help"
                        />
                      ) : (
                        <div className="text-4xl cursor-help">{stamp.emoji}</div>
                      )}
                      <p className="mt-1">{stamp.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={clearCanvas} variant="destructive" className="w-full" size="lg">
                <Eraser className="mr-2" />
                Clear
              </Button>
              <Button onClick={downloadDrawing} variant="secondary" className="w-full" size="lg">
                <Download className="mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white p-4 rounded-2xl border-4 border-primary">
              <canvas
                ref={canvasRef}
                onMouseDown={(e) => {
                  if (showStamps) {
                    // Stamp mode
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (rect) {
                      const stampIndex = Math.floor(Math.random() * stamps.length);
                      addStamp(stamps[stampIndex], e);
                    }
                  } else {
                    startDrawing(e);
                  }
                }}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border-4 border-gray-300 rounded-lg cursor-crosshair w-full"
                style={{ maxWidth: '800px', height: 'auto', aspectRatio: '4/3' }}
              />
            </div>
            <p className="text-center mt-4 text-lg text-muted-foreground">
              {showStamps ? "Click on the canvas to add a random sticker!" : "Click and drag to draw!"}
            </p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default DrawingPad;
