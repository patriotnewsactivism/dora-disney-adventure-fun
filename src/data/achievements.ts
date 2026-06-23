export type AchievementId = string;

export type AchievementCategory = 'game_completion' | 'skill_mastery' | 'exploration' | 'social' | 'collection';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string; // URL or path to an icon image
  category: AchievementCategory;
  points: number; // How many points this achievement is worth
  hidden?: boolean; // If true, achievement is not shown until unlocked
  criteria?: any; // Specific criteria for unlocking, e.g., { game: 'Memory', completions: 5 }
  shareable: boolean; // Can this achievement be shared?
  accessibilityLabel: string; // For screen readers
}

export const achievements: Achievement[] = [
  {
    id: 'first_game_completed',
    name: 'First Steps',
    description: 'Complete your first game!',
    icon: '/icons/achievements/first_game.png',
    category: 'game_completion',
    points: 10,
    hidden: false,
    criteria: { type: 'game_completion', count: 1 },
    shareable: true,
    accessibilityLabel: 'First Steps achievement: Complete your first game',
  },
];
