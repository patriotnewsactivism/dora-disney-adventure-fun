import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import winAnimation from "@/assets/animations/win.json";
import loseAnimation from "@/assets/animations/lose.json";
import neutralAnimation from "@/assets/animations/neutral.json";
import { reactions } from "@/utils/reactions";

interface ReactionState {
  animation: any;
  isVisible: boolean;
}

const CharacterReactions = () => {
  const [reaction, setReaction] = useState<ReactionState>({
    animation: null,
    isVisible: false
  });

  const handleReaction = (event: CustomEvent) => {
    const reactionType = event.detail;
    const animation = reactions[reactionType];
    if (animation) {
      setReaction({
        animation,
        isVisible: true
      });
      setTimeout(() => {
        setReaction(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    }
  };

  useEffect(() => {
    const handler = (event: CustomEvent) => handleReaction(event);
    window.addEventListener('triggerCharacterReaction', handler as EventListener);

    const cleanupHandler = () => {
      setReaction({
        animation: null,
        isVisible: false
      });
    };
    window.addEventListener('cleanupCharacterReactions', cleanupHandler);

    return () => {
      window.removeEventListener('triggerCharacterReaction', handler as EventListener);
      window.removeEventListener('cleanupCharacterReactions', cleanupHandler);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {reaction.isVisible && (
        <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
          <Lottie
            animationData={reaction.animation}
            loop={false}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default CharacterReactions;