import correctAnimation from '@/assets/animations/correct.json';
import incorrectAnimation from '@/assets/animations/incorrect.json';
import winAnimation from '@/assets/animations/win.json';
import loseAnimation from '@/assets/animations/lose.json';
import neutralAnimation from '@/assets/animations/neutral.json';

export type ReactionType = 'correct' | 'incorrect' | 'win' | 'lose' | 'neutral';

interface ReactionData {
  animationData: any; // Lottie animation JSON
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  duration?: number; // How long to display the animation in ms, if not looping
}

export const reactions: Record<ReactionType, ReactionData> = {
  correct: {
    animationData: correctAnimation,
    loop: false,
    autoplay: true,
    speed: 1,
    duration: 1500, // Display for 1.5 seconds
  },
  incorrect: {
    animationData: incorrectAnimation,
    loop: false,
    autoplay: true,
    speed: 1,
    duration: 1500, // Display for 1.5 seconds
  },
  win: {
    animationData: winAnimation,
    loop: false,
    autoplay: true,
    speed: 1,
    duration: 3000, // Display for 3 seconds
  },
  lose: {
    animationData: loseAnimation,
    loop: false,
    autoplay: true,
    speed: 1,
    duration: 3000, // Display for 3 seconds
  },
  neutral: {
    animationData: neutralAnimation,
    loop: false,
    autoplay: true,
    speed: 1,
    duration: 2000, // Display for 2 seconds
  },
};

// Custom event for triggering character reactions
export const CHARACTER_REACTION_EVENT = 'characterReactionEvent';

export const triggerCharacterReaction = (type: ReactionType) => {
  const event = new CustomEvent(CHARACTER_REACTION_EVENT, {
    detail: { type },
  });
  window.dispatchEvent(event);
};
