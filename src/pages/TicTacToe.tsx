import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import CharacterPopup from "@/components/CharacterPopup";
import mickeyImg from "@/assets/mickey.png";
import minnieImg from "@/assets/minnie.png";
import { cn } from "@/lib/utils";
import { triggerCharacterReaction } from "@/data/reactions";

type Player = "X" | "O" | null;
type GameStatus = Player | "tie";

const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<GameStatus>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const checkWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  };

  useEffect(() => {
    const gameWinner = checkWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      setPopupMessage(gameWinner === "X" ? "Mickey wins! 🎉" : "Minnie wins! 🎉");
      setShowPopup(true);
      triggerCharacterReaction('win'); // Trigger win reaction
    } else if (board.every((cell) => cell !== null)) {
      setWinner("tie");
      setPopupMessage("It's a tie! Great game! 🤝");
      setShowPopup(true);
      triggerCharacterReaction('neutral'); // Trigger neutral reaction for a tie
    }
  }, [board]);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
    // For TicTacToe, a move isn't inherently 'correct' or 'incorrect' until the game ends.
    // We can trigger a neutral reaction on each valid move.
    triggerCharacterReaction('neutral');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setShowPopup(false);
    triggerCharacterReaction('neutral'); // Reset to neutral reaction on new game
  };

  useEffect(() => {
    triggerCharacterReaction('neutral'); // Initial reaction when component mounts
  }, []);

  return (
    <GameLayout title="Tic-Tac-Toe ✖️⭕">
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <img src={mickeyImg} alt="Mickey" className="w-24 h-24 object-contain mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">Mickey (X)</p>
            </div>
            <div className="text-center">
              <img src={minnieImg} alt="Minnie" className="w-24 h-24 object-contain mx-auto mb-2" />
              <p className="text-2xl font-bold text-accent">Minnie (O)</p>
            </div>
          </div>

          {!winner && (
            <p className="text-3xl font-bold text-foreground">
              {isXNext ? "Mickey's Turn! (X)" : "Minnie's Turn! (O)"}
            </p>
          )}
          {winner && winner !== "tie" && (
            <p className="text-4xl font-bold text-success animate-bounce">
              {winner === "X" ? "🎉 Mickey Wins! 🎉" : "🎉 Minnie Wins! 🎉"}
            </p>
          )}
          {winner === "tie" && (
            <p className="text-4xl font-bold text-muted-foreground animate-bounce">
              🤝 It's a Tie! 🤝
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className={cn(
                "aspect-square bg-white border-4 border-primary rounded-2xl flex items-center justify-center text-6xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50",
                cell === "X" && "text-primary",
                cell === "O" && "text-accent",
                "min-w-[44px] min-h-[44px]"
              )}
              disabled={!!cell || !!winner}
            >
              {cell === "X" && <img src={mickeyImg} alt="Mickey" className="w-20 h-20 object-contain" />}
              {cell === "O" && <img src={minnieImg} alt="Minnie" className="w-20 h-20 object-contain" />}
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6 h-14">
            <Shuffle className="mr-2 h-6 w-6" />
            New Game
          </Button>
        </div>

        {showPopup && (
          <CharacterPopup
            character={isXNext ? "Minnie" : "Mickey"}
            message={popupMessage}
            image={isXNext ? minnieImg : mickeyImg}
            onComplete={() => setShowPopup(false)}
          />
        )}
      </div>
    </GameLayout>
  );
};

export default TicTacToe;
