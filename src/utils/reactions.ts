import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import winAnimation from "@/assets/animations/win.json";
import loseAnimation from "@/assets/animations/lose.json";
import neutralAnimation from "@/assets/animations/neutral.json";

interface Reactions {
  [key: string]: any;
}

export const reactions: Reactions = {
  correct: correctAnimation,
  incorrect: incorrectAnimation,
  win: winAnimation,
  lose: loseAnimation,
  neutral: neutralAnimation
};

export const triggerCharacterReaction = (reactionType: string) => {
  window.dispatchEvent(new CustomEvent('triggerCharacterReaction', {
    detail: reactionType
  }));
};