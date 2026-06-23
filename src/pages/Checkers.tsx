import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import simbaImg from "@/assets/simba.png";
import elsaImg from "@/assets/elsa.png";

type Piece = {
  player: 1 | 2;
  isKing: boolean;
} | null;

type Board = Piece[][];

const Checkers = () => {
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);

  function initializeBoard(): Board {
    const newBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place player 1 pieces (top)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { player: 1, isKing: false };
        }
      }
    }
    
    // Place player 2 pieces (bottom)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { player: 2, isKing: false };
        }
      }
    }
    
    return newBoard;
  }

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];
    
    if (selectedPiece) {
      // Try to move the selected piece
      const [selectedRow, selectedCol] = selectedPiece;
      const selectedPieceData = board[selectedRow][selectedCol];
      
      if (selectedPieceData && selectedPieceData.player === currentPlayer) {
        if (isValidMove(selectedRow, selectedCol, row, col)) {
          movePiece(selectedRow, selectedCol, row, col);
          setSelectedPiece(null);
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        } else {
          setSelectedPiece(null);
        }
      }
    } else if (piece && piece.player === currentPlayer) {
      // Select a piece
      setSelectedPiece([row, col]);
    }
  };

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece || board[toRow][toCol]) return false;
    
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // Regular move
    if (colDiff === 1 && Math.abs(rowDiff) === 1) {
      if (piece.isKing) return true;
      return piece.player === 1 ? rowDiff > 0 : rowDiff < 0;
    }
    
    return false;
  };

  const movePiece = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    
    if (piece) {
      newBoard[toRow][toCol] = {
        ...piece,
        isKing: piece.isKing || (piece.player === 1 && toRow === 7) || (piece.player === 2 && toRow === 0)
      };
      newBoard[fromRow][fromCol] = null;
      setBoard(newBoard);
    }
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedPiece(null);
    setCurrentPlayer(1);
  };

  return (
    <GameLayout title="Checkers ð¯">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <img src={simbaImg} alt="Simba" className="w-24 h-24 object-contain mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">Player 1 (Simba)</p>
            </div>
            <div className="text-center">
              <img src={elsaImg} alt="Elsa" className="w-24 h-24 object-contain mx-auto mb-2" />
              <p className="text-2xl font-bold text-accent">Player 2 (Elsa)</p>
            </div>
          </div>

          <p className="text-3xl font-bold text-foreground mb-4">
            {currentPlayer === 1 ? "Simba's Turn!" : "Elsa's Turn!"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 mb-8 border-4 border-primary shadow-xl max-w-2xl mx-auto">
          <div className="grid grid-cols-8 gap-0">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isDark = (rowIndex + colIndex) % 2 === 1;
                const isSelected = selectedPiece?.[0] === rowIndex && selectedPiece?.[1] === colIndex;
                
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className={cn(
                      "aspect-square flex items-center justify-center border transition-all",
                      isDark ? "bg-amber-700" : "bg-amber-100",
                      isSelected && "ring-4 ring-success ring-inset"
                    )}
                  >
                    {piece && (
                      <div className="relative w-full h-full p-1">
                        <img
                          src={piece.player === 1 ? simbaImg : elsaImg}
                          alt={piece.player === 1 ? "Simba" : "Elsa"}
                          className="w-full h-full object-contain"
                        />
                        {piece.isKing && (
                          <div className="absolute top-0 right-0 text-2xl">ð</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="text-center">
          <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
            <Shuffle className="mr-2 h-6 w-6" />
            New Game
          </Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default Checkers;
