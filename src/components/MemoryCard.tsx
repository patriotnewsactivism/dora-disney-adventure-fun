import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
  id: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  cardValue: string;
}

const MemoryCard = ({ image, isFlipped, isMatched, onClick, cardValue }: MemoryCardProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isMatched) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isMatched]);

  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className={cn(
        "relative aspect-square w-full rounded-3xl transition-all duration-300 transform",
        "hover:scale-105 active:scale-95",
        "disabled:cursor-not-allowed",
        animate && "animate-bounce"
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: isFlipped || isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
      aria-label={`${cardValue} card, ${isMatched ? 'matched' : isFlipped ? 'flipped' : 'not flipped'}`}
    >
      {/* Card back - question mark */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl flex items-center justify-center",
          "bg-gradient-to-br from-primary to-accent shadow-lg",
          "backface-hidden"
        )}
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(0deg)",
        }}
        aria-hidden="true"
      >
        <span className="text-6xl font-bold text-white">?</span>
      </div>

      {/* Card front - character */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl p-4 flex items-center justify-center",
          "bg-white shadow-xl border-4",
          isMatched ? "border-success" : "border-secondary",
          "backface-hidden"
        )}
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
        aria-hidden="true"
      >
        <img
          src={image}
          alt=""
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
    </button>
  );
};

export default MemoryCard;