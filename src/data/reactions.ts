import correctAnimation from '@/assets/animations/correct.json'; // Placeholder
import incorrectAnimation from '@/assets/animations/incorrect.json'; // Placeholder
import winAnimation from '@/assets/animations/win.json'; // Placeholder
import loseAnimation from '@/assets/animations/lose.json'; // Placeholder
import neutralAnimation from '@/assets/animations/neutral.json'; // Placeholder

export type ReactionType = 'correct' | 'incorrect' | 'win' | 'lose' | 'neutral';

interface AnimationData {
  json: any;
  duration?: number; // Optional duration in ms if known, for better control
}

export const reactionAnimations: Record<ReactionType, AnimationData> = {
  correct: { json: correctAnimation, duration: 1500 },
  incorrect: { json: incorrectAnimation, duration: 1500 },
  win: { json: winAnimation, duration: 2500 },
  lose: { json: loseAnimation, duration: 2000 },
  neutral: { json: neutralAnimation, duration: 1000 },
};

export const REACTION_EVENT_NAME = 'characterReaction';

export const triggerCharacterReaction = (type: ReactionType) => {
  const event = new CustomEvent<ReactionType>(REACTION_EVENT_NAME, { detail: type });
  window.dispatchEvent(event);
};
