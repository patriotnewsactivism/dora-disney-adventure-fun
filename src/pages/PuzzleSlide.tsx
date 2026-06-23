import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, Shuffle } from "lucide-react";
import Confetti from "@/components/Confetti";
import { cn } from "@/lib/utils";

interface Tile {
  id: number;
  position: number;
  isEmpty: boolean;
}

const PuzzleSlide = () => {
  const [gridSize, setGridSize] = useState(3); // 3x3, 4x4, or 5x5
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const initializePuzzle = (size: number) => {
    const totalTiles = size * size;
    const newTiles: Tile[] = [];

    for (let i = 0; i < totalTiles; i++) {
      newTiles.push({
        id: i,
        position: i,
        isEmpty: i === totalTiles - 1,
      });
    }

    setTiles(newTiles);
    setMoves(0);
    setIsSolved(false);
    setShowConfetti(false);
  };

  const shufflePuzzle = () => {
    const totalTiles = gridSize * gridSize;
    let shuffled = [...tiles];

    // Perform many random moves to shuffle
    for (let i = 0; i < 100; i++) {
      const emptyIndex = shuffled.findIndex(t => t.isEmpty);
      const movableTiles = getMovableTiles(emptyIndex, shuffled);

      if (movableTiles.length > 0) {
        const randomMove = movableTiles[Math.floor(Math.random() * movableTiles.length)];
        const temp = shuffled[emptyIndex].position;
        shuffled[emptyIndex] = { ...shuffled[emptyIndex], position: shuffled[randomMove].position };
        shuffled[randomMove] = { ...shuffled[randomMove], position: temp };
      }
    }

    setTiles(shuffled);
    setMoves(0);
    setIsSolved(false);
    setShowConfetti(false);
  };

  useEffect(() => {
    initializePuzzle(gridSize);
  }, [gridSize]);

  const getMovableTiles = (emptyIndex: number, currentTiles: Tile[]) => {
    const movable: number[] = [];
    const row = Math.floor(emptyIndex / gridSize);
    const col = emptyIndex % gridSize;

    // Check all four directions
    if (row > 0) movable.push(emptyIndex - gridSize); // Up
    if (row < gridSize - 1) movable.push(emptyIndex + gridSize); // Down
    if (col > 0) movable.push(emptyIndex - 1); // Left
    if (col < gridSize - 1) movable.push(emptyIndex + 1); // Right

    return movable;
  };

  const handleTileClick = (clickedIndex: number) => {
    if (isSolved) return;

    const emptyIndex = tiles.findIndex(t => t.isEmpty);
    const movableTiles = getMovableTiles(emptyIndex, tiles);

    if (movableTiles.includes(clickedIndex)) {
      const newTiles = [...tiles];
      const temp = newTiles[emptyIndex].position;
      newTiles[emptyIndex] = { ...newTiles[emptyIndex], position: newTiles[clickedIndex].position };
      newTiles[clickedIndex] = { ...newTiles[clickedIndex], position: temp };

      setTiles(newTiles);
      setMoves(prev => prev + 1);

      // Check if solved
      const solved = newTiles.every(tile => tile.id === tile.position);
      if (solved) {
        setIsSolved(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  };

  const getTileStyle = (tile: Tile) => {
    const row = Math.floor(tile.position / gridSize);
    const col = tile.position % gridSize;
    const tileNumber = tile.id + 1;

    // Create gradient based on tile number
    const hue = (tileNumber * 360) / (gridSize * gridSize);
    return {
      background: tile.isEmpty ? 'transparent' : `hsl(${hue}, 70%, 60%)`,
    };
  };

  return (
    <GameLayout title="Puzzle Slide! ð§©">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Slide the Tiles!
          </h2>
          <p className="text-xl text-muted-foreground">
            Put the numbers in order!
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="flex justify-center gap-4 mb-8">
          {[3, 4, 5].map(size => (
            <Button
              key={size}
              onClick={() => setGridSize(size)}
              variant={gridSize === size ? "default" : "outline"}
              size="lg"
              className="text-xl"
            >
              {size}x{size}
            </Button>
          ))}
        </div>

        <div className="mb-6 flex justify-between items-center px-4">
          <div className="text-2xl font-bold">
            Moves: <span className="text-primary">{moves}</span>
          </div>
          <div className="text-2xl font-bold">
            Difficulty: <span className="text-accent">{gridSize}x{gridSize}</span>
          </div>
        </div>

        {/* Puzzle Grid */}
        <div
          className="mx-auto mb-8 p-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl border-4 border-primary"
          style={{
            maxWidth: `${gridSize * 100}px`,
          }}
        >
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {tiles.map((tile, index) => (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={isSolved}
                className={cn(
                  "aspect-square rounded-xl border-4 font-bold text-white text-4xl transition-all duration-200",
                  tile.isEmpty ? "border-transparent cursor-default" : "border-white shadow-lg hover:scale-105 active:scale-95 cursor-pointer",
                  isSolved && "cursor-default"
                )}
                style={getTileStyle(tile)}
              >
                {!tile.isEmpty && tile.id + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Controls and Status */}
        <div className="text-center space-y-4">
          {isSolved && (
            <div className="animate-bounce mb-6">
              <h2 className="text-5xl font-bold text-success mb-2">
                ð Puzzle Solved! ð
              </h2>
              <p className="text-2xl text-muted-foreground">
                You solved it in {moves} moves!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={() => initializePuzzle(gridSize)} size="lg" className="text-xl px-8 py-6">
              <RotateCcw className="mr-2 h-6 w-6" />
              Reset
            </Button>
            <Button onClick={shufflePuzzle} size="lg" className="text-xl px-8 py-6" variant="secondary">
              <Shuffle className="mr-2 h-6 w-6" />
              Shuffle
            </Button>
          </div>

          {!isSolved && moves > 0 && (
            <p className="text-lg text-muted-foreground">
              Click a tile next to the empty space to move it!
            </p>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default PuzzleSlide;
