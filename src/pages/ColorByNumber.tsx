import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Shuffle, Sparkles } from "lucide-react";
import CharacterPopup from "@/components/CharacterPopup";
import moanaImg from "@/assets/moana.png";
import { cn } from "@/lib/utils";

type ColorCell = {
  colorNumber: number;
  filled: boolean;
};

const colors = [
  { number: 1, color: "#FF6B6B", name: "Red" },
  { number: 2, color: "#4ECDC4", name: "Cyan" },
  { number: 3, color: "#FFE66D", name: "Yellow" },
  { number: 4, color: "#A8E6CF", name: "Green" },
  { number: 5, color: "#FF9A9E", name: "Pink" },
  { number: 6, color: "#B4A0E5", name: "Purple" },
];

const designs = [
  {
    name: "Heart",
    pattern: [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 2, 2, 1, 1, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    name: "Star",
    pattern: [
      [0, 0, 0, 3, 3, 0, 0, 0],
      [0, 0, 3, 4, 4, 3, 0, 0],
      [3, 3, 3, 4, 4, 3, 3, 3],
      [0, 3, 4, 4, 4, 4, 3, 0],
      [0, 0, 3, 4, 4, 3, 0, 0],
      [0, 3, 0, 3, 3, 0, 3, 0],
      [3, 0, 0, 0, 0, 0, 0, 3],
    ],
  },
  {
    name: "Butterfly",
    pattern: [
      [5, 5, 0, 6, 6, 0, 5, 5],
      [5, 5, 5, 6, 6, 5, 5, 5],
      [5, 5, 5, 6, 6, 5, 5, 5],
      [0, 5, 5, 6, 6, 5, 5, 0],
      [0, 0, 5, 6, 6, 5, 0, 0],
      [0, 0, 0, 6, 6, 0, 0, 0],
      [0, 0, 0, 6, 6, 0, 0, 0],
    ],
  },
];

const ColorByNumber = () => {
  const [currentDesign] = useState(designs[0]);
  const [selectedColor, setSelectedColor] = useState<number>(1);
  const [grid, setGrid] = useState<ColorCell[][]>(
    currentDesign.pattern.map((row) =>
      row.map((colorNumber) => ({
        colorNumber,
        filled: colorNumber === 0,
      }))
    )
  );
  const [showPopup, setShowPopup] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    const cell = grid[row][col];
    if (cell.colorNumber === 0 || cell.filled) return;

    if (cell.colorNumber === selectedColor) {
      const newGrid = [...grid];
      newGrid[row][col] = { ...cell, filled: true };
      setGrid(newGrid);

      // Check if design is complete
      const allFilled = newGrid.every((row) => row.every((cell) => cell.filled));
      if (allFilled) {
        setShowPopup(true);
      }
    }
  };

  const resetDesign = () => {
    setGrid(
      currentDesign.pattern.map((row) =>
        row.map((colorNumber) => ({
          colorNumber,
          filled: colorNumber === 0,
        }))
      )
    );
    setShowPopup(false);
  };

  const isComplete = grid.every((row) => row.every((cell) => cell.filled));

  return (
    <GameLayout title="Color by Number 🎨">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img src={moanaImg} alt="Moana" className="w-32 h-32 object-contain mx-auto mb-4" />
          <p className="text-2xl text-muted-foreground mb-6">
            Click on cells that match the selected color number!
          </p>

          {isComplete && (
            <p className="text-4xl font-bold text-success animate-bounce mb-4">
              🎨 Beautiful! You completed it! 🎨
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 mb-8 border-4 border-primary shadow-xl">
          <h3 className="text-2xl font-bold text-center mb-4 text-foreground">
            Color Palette
          </h3>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {colors.map((color) => (
              <button
                key={color.number}
                onClick={() => setSelectedColor(color.number)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-4 transition-all",
                  selectedColor === color.number
                    ? "border-primary scale-110 shadow-xl"
                    : "border-border hover:scale-105"
                )}
              >
                <div
                  className="w-16 h-16 rounded-full border-4 border-foreground"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-2xl font-bold">{color.number}</span>
                <span className="text-sm text-muted-foreground">{color.name}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-1 max-w-2xl mx-auto" style={{ gridTemplateColumns: `repeat(8, 1fr)` }}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const cellColor = colors.find((c) => c.number === cell.colorNumber);
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={cn(
                      "aspect-square border-2 border-border rounded-lg transition-all hover:scale-105",
                      !cell.filled && cell.colorNumber !== 0 && "hover:shadow-lg"
                    )}
                    style={{
                      backgroundColor: cell.filled && cellColor ? cellColor.color : "#f0f0f0",
                    }}
                  >
                    {!cell.filled && cell.colorNumber !== 0 && (
                      <span className="text-lg font-bold text-foreground">{cell.colorNumber}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="text-center">
          <Button onClick={resetDesign} size="lg" className="text-xl px-8 py-6">
            <Shuffle className="mr-2 h-6 w-6" />
            Reset Design
          </Button>
        </div>

        {showPopup && (
          <CharacterPopup
            character="Moana"
            message="You're an amazing artist! 🎨✨"
            image={moanaImg}
            onComplete={() => setShowPopup(false)}
          />
        )}
      </div>
    </GameLayout>
  );
};

export default ColorByNumber;
