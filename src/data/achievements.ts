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
    description: 'Complete your very first game!',
    icon: '/icons/achievements/first_steps.png',
    category: 'game_completion',
    points: 10,
    criteria: { type: 'game_completion', count: 1 },
    shareable: true,
    accessibilityLabel: 'Achievement: First Steps, complete your very first game'
  },
  {
    id: 'memory_master_bronze',
    name: 'Memory Novice',
    description: 'Complete 5 Memory games.',
    icon: '/icons/achievements/memory_novice.png',
    category: 'skill_mastery',
    points: 20,
    criteria: { type: 'game_completion', game: 'Memory', count: 5 },
    shareable: true,
    accessibilityLabel: 'Achievement: Memory Novice, complete 5 Memory games'
  },
  {
    id: 'memory_master_silver',
    name: 'Memory Enthusiast',
    description: 'Complete 15 Memory games.',
    icon: '/icons/achievements/memory_enthusiast.png',
    category: 'skill_mastery',
    points: 50,
    criteria: { type: 'game_completion', game: 'Memory', count: 15 },
    shareable: true,
    accessibilityLabel: 'Achievement: Memory Enthusiast, complete 15 Memory games'
  },
  {
    id: 'explorer_beginner',
    name: 'Curious Explorer',
    description: 'Visit 3 different game pages.',
    icon: '/icons/achievements/curious_explorer.png',
    category: 'exploration',
    points: 15,
    criteria: { type: 'page_visits', count: 3, unique: true },
    shareable: false,
    accessibilityLabel: 'Achievement: Curious Explorer, visit 3 different game pages'
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share an achievement with a friend.',
    icon: '/icons/achievements/social_butterfly.png',
    category: 'social',
    points: 25,
    hidden: true,
    criteria: { type: 'share_achievement', count: 1 },
    shareable: true,
    accessibilityLabel: 'Achievement: Social Butterfly, share an achievement with a friend'
  },
  {
    id: 'storyteller_apprentice',
    name: 'Storyteller Apprentice',
    description: 'Create your first story in Storybook Builders.',
    icon: '/icons/achievements/storyteller_apprentice.png',
    category: 'game_completion',
    points: 30,
    criteria: { type: 'game_action', game: 'StorybookBuilders', action: 'create_story', count: 1 },
    shareable: true,
    accessibilityLabel: 'Achievement: Storyteller Apprentice, create your first story in Storybook Builders'
  }
];
