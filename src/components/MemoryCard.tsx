import { useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
  id: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  cardValue: string;
  tabIndex?: number;
  'aria-current'?: 'true' | undefined;
}

const MemoryCard = forwardRef<HTMLButtonElement, MemoryCardProps>(({ image, isFlipped, isMatched, onClick, cardValue, tabIndex, 'aria-current': ariaCurrent }, ref) => {
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
      ref={ref}
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className={cn(
        "relative aspect-square w-full rounded-3xl transition-all duration-300 transform",
        "hover:scale-105 active:scale-95",
        "disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2", // Visible focus indicator
        animate && "animate-bounce"
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: isFlipped || isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
      aria-label={`${cardValue} card, ${isMatched ? 'matched' : isFlipped ? 'flipped' : 'not flipped'}`}
      tabIndex={tabIndex}
      aria-current={ariaCurrent}
      role="gridcell"
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
          alt={cardValue} // Alt text for the image
          className="w-full h-full object-contain"
        />
      </div>
    </button>
  );
});

MemoryCard.displayName = 'MemoryCard';

export default MemoryCard;
