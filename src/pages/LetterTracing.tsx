import { useState, useRef, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight } from "lucide-react";
import Confetti from "@/components/Confetti";
import mickeyImg from "@/assets/mickey.png";
import elsaImg from "@/assets/elsa.png";
import doraImg from "@/assets/dora.png";

const LetterTracing = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLetter, setCurrentLetter] = useState("A");
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const characters = [mickeyImg, elsaImg, doraImg];
  const [currentCharacter] = useState(characters[Math.floor(Math.random() * characters.length)]);

  useEffect(() => {
    drawLetter();
  }, [currentLetter]);

  const drawLetter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw letter outline
    ctx.strokeStyle = "#e2e8f0";
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 300px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeText(currentLetter, canvas.width / 2, canvas.height / 2);
    ctx.fillText(currentLetter, canvas.width / 2, canvas.height / 2);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const checkCompletion = () => {
    setCompleted(true);
    setScore(prev => prev + 1);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      setCompleted(false);
    }, 2000);
  };

  const nextLetter = () => {
    const currentIndex = letters.indexOf(currentLetter);
    const nextIndex = (currentIndex + 1) % letters.length;
    setCurrentLetter(letters[nextIndex]);
    setCompleted(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLetter();
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLetter();
    setCompleted(false);
  };

  const resetGame = () => {
    setCurrentLetter("A");
    setScore(0);
    setCompleted(false);
    clearCanvas();
  };

  return (
    <GameLayout title="Letter Tracing! ✏️">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src={currentCharacter} alt="Character" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-3xl font-bold text-primary">
                Trace the Letter!
              </h2>
              <p className="text-xl text-muted-foreground">
                Draw over the letter
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold">
            Score: <span className="text-primary">{score}</span>
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="text-8xl font-bold text-primary mb-2">
            {currentLetter}
          </div>
          <p className="text-2xl text-muted-foreground">
            Trace this letter with your finger or mouse!
          </p>
        </div>

        <div className="bg-white rounded-3xl border-4 border-primary p-4 mb-6">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {completed && (
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-success animate-bounce">
              🌟 Great Job! 🌟
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={checkCompletion} size="lg" className="text-xl px-8 py-6">
            ✓ Done Tracing!
          </Button>

          <Button onClick={nextLetter} size="lg" variant="secondary" className="text-xl px-8 py-6">
            <ArrowRight className="mr-2 h-6 w-6" />
            Next Letter
          </Button>

          <Button onClick={clearCanvas} size="lg" variant="outline" className="text-xl px-8 py-6">
            Clear
          </Button>

          <Button onClick={resetGame} size="lg" variant="outline" className="text-xl px-8 py-6">
            <RotateCcw className="mr-2 h-6 w-6" />
            Reset
          </Button>
        </div>

        {score >= 5 && (
          <div className="mt-6 text-center">
            <h3 className="text-4xl font-bold text-success mb-2">
              🏆 Letter Master! 🏆
            </h3>
            <p className="text-2xl text-muted-foreground">
              You've traced {score} letters!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default LetterTracing;
