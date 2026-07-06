import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import CharacterPopup from "@/components/CharacterPopup";
import doraImg from "@/assets/dora.png";
import { cn } from "@/lib/utils";

const words = [
  { word: "MICKEY", hint: "A famous mouse!" },
  { word: "FROZEN", hint: "Let it go..." },
  { word: "SIMBA", hint: "The Lion King" },
  { word: "DORA", hint: "Explorer with a map" },
  { word: "MOANA", hint: "Island princess" },
  { word: "ELSA", hint: "Ice queen" },
  { word: "MINNIE", hint: "Mickey's friend" },
  { word: "DISNEY", hint: "Magic kingdom" },
];

const Hangman = () => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const maxWrongGuesses = 6;

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const wordLetters = currentWord.word.split("");
    const allGuessed = wordLetters.every((letter) => guessedLetters.includes(letter));
    
    if (allGuessed && guessedLetters.length > 0) {
      setGameWon(true);
      setShowPopup(true);
    }
  }, [guessedLetters, currentWord]);

  useEffect(() => {
    if (wrongGuesses >= maxWrongGuesses) {
      setGameLost(true);
      setShowPopup(true);
    }
  }, [wrongGuesses]);

  const handleLetterClick = (letter: string) => {
    if (guessedLetters.includes(letter) || gameWon || gameLost) return;

    setGuessedLetters([...guessedLetters, letter]);

    if (!currentWord.word.includes(letter)) {
      setWrongGuesses(wrongGuesses + 1);
    }
  };

  const resetGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
    setShowPopup(false);
  };

  const displayWord = currentWord.word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  return (
    <GameLayout title="Hangman 📝">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img src={doraImg} alt="Dora" className="w-32 h-32 object-contain mx-auto mb-4" />
            <p className="text-2xl text-muted-foreground mb-4">
              Hint: <span className="font-bold text-accent">{currentWord.hint}</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 mb-6 border-4 border-primary shadow-xl">
            <p className="text-5xl font-bold text-primary tracking-widest mb-4">{displayWord}</p>
            <p className="text-2xl text-muted-foreground">
              Wrong guesses: <span className="font-bold text-destructive">{wrongGuesses}/{maxWrongGuesses}</span>
            </p>
          </div>

          {gameWon && (
            <p className="text-4xl font-bold text-success animate-bounce mb-4">
              🎉 You Won! Great Job! 🎉
            </p>
          )}
          {gameLost && (
            <p className="text-4xl font-bold text-destructive animate-bounce mb-4">
              😢 Game Over! The word was {currentWord.word}
            </p>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-8">
          {alphabet.map((letter) => (
            <Button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={guessedLetters.includes(letter) || gameWon || gameLost}
              className={cn(
                "text-xl font-bold h-14",
                guessedLetters.includes(letter) && currentWord.word.includes(letter)
                  ? "bg-success hover:bg-success"
                  : guessedLetters.includes(letter)
                  ? "bg-destructive hover:bg-destructive"
                  : ""
              )}
            >
              {letter}
            </Button>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6">
            <Shuffle className="mr-2 h-6 w-6" />
            New Word
          </Button>
        </div>

        {showPopup && (
          <CharacterPopup
            character="Dora"
            message={gameWon ? "Excelente! You got it! 🎉" : "Try again! You can do it! 💪"}
            image={doraImg}
            onComplete={() => setShowPopup(false)}
          />
        )}
      </div>
    </GameLayout>
  );
};

export default Hangman;
