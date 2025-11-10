import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CharacterPopupProps {
  character: string;
  message: string;
  image: string;
  duration?: number;
  onComplete?: () => void;
}

const CharacterPopup = ({ character, message, image, duration = 3000, onComplete }: CharacterPopupProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 bg-white rounded-3xl shadow-2xl p-6 border-4 border-primary max-w-sm transition-all duration-500 z-50",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      )}
    >
      <div className="flex items-center gap-4">
        <img src={image} alt={character} className="w-20 h-20 object-contain rounded-full border-4 border-accent" />
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">{character}</h3>
          <p className="text-lg text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default CharacterPopup;
