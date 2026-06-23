import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Define a type for game metadata that includes difficulty and character associations
interface GameMetadata {
  difficulty: number; // e.g., 1-5
  gameType: string; // e.g., 'Memory', 'Puzzle', 'Adventure'
  characters: string[]; // e.g., 'Ariel', 'Mickey'
  minAge: number;
  maxAge: number;
  description: string; // 'Why you'll love this' explanation
  imageUrl: string;
}

// Mock game data (in a real app, this might come from a database or a CMS)
const ALL_GAMES_DATA: Record<string, GameMetadata> = {
  'Memory': { difficulty: 2, gameType: 'Memory', characters: ['Mickey', 'Minnie'], minAge: 3, maxAge: 6, description: 'Test your memory with fun characters!', imageUrl: '/images/memory_game.png' },
  'Memory-Level-2': { difficulty: 3, gameType: 'Memory', characters: ['Donald', 'Daisy'], minAge: 4, maxAge: 7, description: 'A bit harder memory challenge!', imageUrl: '/images/memory_game_2.png' },
  'Memory-Level-3': { difficulty: 4, gameType: 'Memory', characters: ['Goofy', 'Pluto'], minAge: 5, maxAge: 8, description: 'Advanced memory puzzles!', imageUrl: '/images/memory_game_3.png' },
  'PuzzleSlide': { difficulty: 2, gameType: 'Puzzle', characters: ['Elsa', 'Anna'], minAge: 4, maxAge: 7, description: 'Slide pieces to complete the picture!', imageUrl: '/images/puzzle_slide.png' },
  'CountingGame': { difficulty: 1, gameType: 'Educational', characters: ['Pooh', 'Piglet'], minAge: 2, maxAge: 5, description: 'Learn to count with your favorite friends!', imageUrl: '/images/counting_game.png' },
  'DrawingPad': { difficulty: 1, gameType: 'Creative', characters: ['Olaf'], minAge: 3, maxAge: 9, description: 'Unleash your creativity with a digital canvas!', imageUrl: '/images/drawing_pad.png' },
  'TicTacToe': { difficulty: 2, gameType: 'Strategy', characters: ['Mickey', 'Minnie'], minAge: 5, maxAge: 10, description: 'Classic fun for two players!', imageUrl: '/images/tic_tac_toe.png' },
  'Hangman': { difficulty: 3, gameType: 'Word', characters: ['Goofy'], minAge: 6, maxAge: 12, description: 'Guess the word before time runs out!', imageUrl: '/images/hangman.png' },
  'ColorByNumber': { difficulty: 2, gameType: 'Creative', characters: ['Donald', 'Daisy'], minAge: 4, maxAge: 8, description: 'Bring pictures to life by coloring!', imageUrl: '/images/color_by_number.png' },
  'BalloonPop': { difficulty: 1, gameType: 'Arcade', characters: ['Mickey'], minAge: 2, maxAge: 6, description: 'Pop balloons and have a blast!', imageUrl: '/images/balloon_pop.png' },
  'ShapeSorter': { difficulty: 1, gameType: 'Educational', characters: ['Pooh'], minAge: 2, maxAge: 4, description: 'Match shapes and learn geometry!', imageUrl: '/images/shape_sorter.png' },
  'SimonSays': { difficulty: 3, gameType: 'Memory', characters: ['Minnie'], minAge: 5, maxAge: 9, description: 'Follow the sequence and test your memory!', imageUrl: '/images/simon_says.png' },
  'WhackAMole': { difficulty: 2, gameType: 'Arcade', characters: ['Goofy'], minAge: 4, maxAge: 8, description: 'Whack the moles as fast as you can!', imageUrl: '/images/whack_a_mole.png' },
  'Storytime': { difficulty: 1, gameType: 'Educational', characters: ['All'], minAge: 2, maxAge: 10, description: 'Enjoy interactive stories!', imageUrl: '/images/storybook.png' },
  'StorybookBuilders': { difficulty: 3, gameType: 'Creative', characters: ['All'], minAge: 6, maxAge: 12, description: 'Create your own magical stories!', imageUrl: '/images/storybook_builders.png' },
  'MusicMaker': { difficulty: 2, gameType: 'Creative', characters: ['Mickey'], minAge: 4, maxAge: 9, description: 'Compose your own tunes!', imageUrl: '/images/music_maker.png' },
  'PrincessAcademy': { difficulty: 2, gameType: 'Roleplay', characters: ['Cinderella', 'Belle'], minAge: 4, maxAge: 8, description: 'Learn to be a princess!', imageUrl: '/images/princess_academy.png' },
  'ArielTreasure': { difficulty: 3, gameType: 'Adventure', characters: ['Ariel'], minAge: 5, maxAge: 9, description: 'Explore the ocean for hidden treasures!', imageUrl: '/images/ariel_treasure.png' },
  'FrozenIceQuest': { difficulty: 4, gameType: 'Adventure', characters: ['Elsa', 'Anna'], minAge: 6, maxAge: 10, description: 'Embark on an icy quest in Arendelle!', imageUrl: '/images/frozen_ice_quest.png' },
  'MoanaRhythm': { difficulty: 3, gameType: 'Music', characters: ['Moana'], minAge: 5, maxAge: 9, description: 'Feel the rhythm of the islands!', imageUrl: '/images/moana_rhythm.png' },
  'EncantoMystery': { difficulty: 4, gameType: 'Puzzle', characters: ['Mirabel'], minAge: 6, maxAge: 10, description: 'Solve the mystery of the Madrigal family!', imageUrl: '/images/encanto_mystery.png' },
  'ZootopiaDetective': { difficulty: 5, gameType: 'Puzzle', characters: ['Judy Hopps', 'Nick Wilde'], minAge: 7, maxAge: 12, description: 'Help solve cases in Zootopia!', imageUrl: '/images/zootopia_detective.png' },
  'SpiderManWebSling': { difficulty: 4, gameType: 'Action', characters: ['Spider-Man'], minAge: 6, maxAge: 10, description: 'Swing through the city as Spider-Man!', imageUrl: '/images/spiderman_web_sling.png' },
  'BigWheelsStunt': { difficulty: 3, gameType: 'Racing', characters: ['Lightning McQueen'], minAge: 5, maxAge: 9, description: 'Perform amazing stunts with monster trucks!', imageUrl: '/images/big_wheels_stunt.png' },
  'MonsterTruckRacing': { difficulty: 3, gameType: 'Racing', characters: ['Lightning McQueen'], minAge: 5, maxAge: 9, description: 'Race monster trucks to victory!', imageUrl: '/images/monster_truck_racing.png' },
  'PixieFlight': { difficulty: 2, gameType: 'Adventure', characters: ['Tinker Bell'], minAge: 4, maxAge: 8, description: 'Fly through Pixie Hollow!', imageUrl: '/images/pixie_flight.png' },
  'PixieHollow': { difficulty: 2, gameType: 'Exploration', characters: ['Tinker Bell'], minAge: 4, maxAge: 8, description: 'Explore the magical world of Pixie Hollow!', imageUrl: '/images/pixie_hollow.png' },
  'MagicCarpet': { difficulty: 3, gameType: 'Adventure', characters: ['Aladdin', 'Jasmine'], minAge: 5, maxAge: 9, description: 'Fly on a magic carpet ride!', imageUrl: '/images/magic_carpet.png' },
  'KingdomBuilder': { difficulty: 4, gameType: 'Strategy', characters: ['All'], minAge: 7, maxAge: 12, description: 'Build and manage your own kingdom!', imageUrl: '/images/kingdom_builder.png' },
  'KingdomCoding': { difficulty: 5, gameType: 'Educational', characters: ['All'], minAge: 8, maxAge: 14, description: 'Learn coding by building a kingdom!', imageUrl: '/images/kingdom_coding.png' },
  'DisneyBakeOff': { difficulty: 2, gameType: 'Creative', characters: ['Mickey', 'Minnie'], minAge: 4, maxAge: 8, description: 'Bake delicious treats with Disney friends!', imageUrl: '/images/disney_bake_off.png' },
  'DisneyEmojiQuest': { difficulty: 3, gameType: 'Puzzle', characters: ['All'], minAge: 5, maxAge: 9, description: 'Match emojis in this fun quest!', imageUrl: '/images/disney_emoji_quest.png' },
  'FrozenMaze': { difficulty: 3, gameType: 'Puzzle', characters: ['Elsa', 'Anna'], minAge: 5, maxAge: 9, description: 'Navigate through an icy maze!', imageUrl: '/images/frozen_maze.png' },
  'LetterTracing': { difficulty: 1, gameType: 'Educational', characters: ['Mickey'], minAge: 3, maxAge: 6, description: 'Practice writing letters!', imageUrl: '/images/letter_tracing.png' },
  'SingAlong': { difficulty: 1, gameType: 'Creative', characters: ['All'], minAge: 2, maxAge: 7, description: 'Sing your favorite Disney songs!', imageUrl: '/images/sing_along.png' }
};

export type RecommendedGame = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  difficulty: number;
  gameType: string;
};

interface RecommendationCache {
  profileId: string;
  timestamp: number;
  recommendations: RecommendedGame[];
  feedback: Record<string, 'liked' | 'disliked' | 'not_interested'>;
}

const CACHE_KEY = 'gameRecommendationsCache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchProfileData(profileId: string): Promise<Tables<'profiles'> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

async function fetchGameProgress(profileId: string): Promise<Tables<'game_progress'>[]> {
  const { data, error } = await supabase
    .from('game_progress')
    .select('*')
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error fetching game progress:', error);
    return [];
  }
  return data || [];
}

async function fetchGameCompletions(profileId: string): Promise<Tables<'game_completions'>[]> {
  const { data, error } = await supabase
    .from('game_completions')
    .select('*')
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error fetching game completions:', error);
    return [];
  }
  return data || [];
}

function getCachedRecommendations(profileId: string): RecommendationCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cache: RecommendationCache = JSON.parse(cached);
      if (cache.profileId === profileId && (Date.now() - cache.timestamp < CACHE_TTL_MS)) {
        return cache;
      }
    }
  } catch (e) {
    console.error('Error parsing recommendation cache from localStorage', e);
  }
  return null;
}

function setCachedRecommendations(profileId: string, recommendations: RecommendedGame[], feedback: Record<string, 'liked' | 'disliked' | 'not_interested'>) {
  const cache: RecommendationCache = {
    profileId,
    timestamp: Date.now(),
    recommendations,
    feedback,
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Error saving recommendation cache to localStorage', e);
  }
}

function getFeedbackFromCache(profileId: string): Record<string, 'liked' | 'disliked' | 'not_interested'> {
  const cached = getCachedRecommendations(profileId);
  return cached ? cached.feedback : {};
}

export function updateRecommendationFeedback(profileId: string, gameId: string, status: 'liked' | 'disliked' | 'not_interested') {
  const cached = getCachedRecommendations(profileId);
  const currentFeedback = cached ? cached.feedback : {};
  currentFeedback[gameId] = status;

  // If there are existing recommendations, update the cache with new feedback
  if (cached) {
    setCachedRecommendations(profileId, cached.recommendations, currentFeedback);
  } else {
    // If no existing recommendations, just store the feedback (it will be used next time recommendations are generated)
    setCachedRecommendations(profileId, [], currentFeedback);
  }
}

export async function getGameRecommendations(profileId: string): Promise<RecommendedGame[]> {
  if (!profileId) {
    console.warn('No profileId provided for recommendations.');
    return [];
  }

  const cached = getCachedRecommendations(profileId);
  if (cached) {
    console.log('Returning cached recommendations.');
    return cached.recommendations;
  }

  console.log('Generating new recommendations...');

  const profile = await fetchProfileData(profileId);
  if (!profile) {
    console.error('Profile not found for recommendations.');
    return [];
  }

  const gameProgress = await fetchGameProgress(profileId);
  const gameCompletions = await fetchGameCompletions(profileId);
  const feedback = getFeedbackFromCache(profileId);

  const age = profile.age;
  const completedGames = new Set(gameCompletions.map(gc => gc.game_id));

  // 1. Analyze recent game completions and scores
  const gameScores: Record<string, number[]> = {};
  const gamePlayTimes: Record<string, number> = {}; // Simple sum for now
  const gameTypesPlayed: Record<string, number> = {};

  gameProgress.forEach(progress => {
    if (progress.game_type) {
      gameTypesPlayed[progress.game_type] = (gameTypesPlayed[progress.game_type] || 0) + 1;
    }
    if (progress.game_type && progress.played_at && progress.completed_at) {
      const startTime = new Date(progress.played_at).getTime();
      const endTime = new Date(progress.completed_at).getTime();
      const duration = (endTime - startTime) / (1000 * 60); // duration in minutes
      gamePlayTimes[progress.game_type] = (gamePlayTimes[progress.game_type] || 0) + duration;
    }
    if (progress.game_type && progress.score !== null) {
      if (!gameScores[progress.game_type]) {
        gameScores[progress.game_type] = [];
      }
      gameScores[progress.game_type].push(progress.score);
    }
  });

  // Determine favorite game types based on play time or count
  const sortedGameTypes = Object.entries(gameTypesPlayed).sort(([, countA], [, countB]) => countB - countA);
  const favoriteGameTypes = sortedGameTypes.slice(0, 2).map(([type]) => type);

  // Determine favorite characters based on avatar usage (from profile) and game choices (more complex, needs game_progress metadata)
  const favoriteCharacters: string[] = profile.avatar_url ? [profile.avatar_url.split('/').pop()?.split('.')[0] || ''] : [];
  // Further character analysis would require game_progress metadata to contain character choices, which is not currently available in types.ts

  let potentialRecommendations: RecommendedGame[] = [];

  // Filter games by age range first
  const ageAppropriateGames = Object.entries(ALL_GAMES_DATA).filter(([, data]) => age >= data.minAge && age <= data.maxAge);

  // Algorithm to weight games by difficulty progression and other factors
  for (const [gameId, gameData] of ageAppropriateGames) {
    // Skip games the child has already completed and games they've marked as 'not interested'
    if (completedGames.has(gameId) || feedback[gameId] === 'not_interested') {
      continue;
    }

    let score = 0;

    // 1. Difficulty progression (e.g., if child completed Memory level 3, suggest Memory level 4 or similar difficulty games)
    // For simplicity, we'll look for games of similar type and slightly higher difficulty
    const completedMemoryGames = gameCompletions.filter(gc => gc.game_id.startsWith('Memory')).map(gc => gc.game_id);
    let maxMemoryDifficulty = 0;
    completedMemoryGames.forEach(game => {
      const data = ALL_GAMES_DATA[game];
      if (data && data.gameType === 'Memory') {
        maxMemoryDifficulty = Math.max(maxMemoryDifficulty, data.difficulty);
      }
    });

    if (gameData.gameType === 'Memory' && gameData.difficulty > maxMemoryDifficulty && gameData.difficulty <= maxMemoryDifficulty + 1) {
      score += 10; // Strongly recommend next difficulty level
    } else if (gameData.gameType === 'Memory' && gameData.difficulty === maxMemoryDifficulty) {
      score += 5; // Recommend similar difficulty
    }

    // 2. Favorite game types
    if (favoriteGameTypes.includes(gameData.gameType)) {
      score += 7; // Boost for favorite game types
    }

    // 3. Favorite characters (simple check for now, can be expanded)
    if (favoriteCharacters.some(char => gameData.characters.includes(char))) {
      score += 5; // Boost for games with favorite characters
    }

    // 4. Games with good scores/completion rates (if available in game_progress metadata)
    // This would require more detailed metadata in game_progress to link specific game_id to scores.
    // For now, we'll assume higher scores in a game type indicate preference for that type.
    const avgScoreForType = gameScores[gameData.gameType]?.reduce((sum, s) => sum + s, 0) / gameScores[gameData.gameType].length || 0;
    if (avgScoreForType > 70) { // Arbitrary threshold
      score += 3;
    }

    // Add a small random factor to break ties and add variety
    score += Math.random();

    potentialRecommendations.push({
      id: gameId,
      name: gameId.replace(/([A-Z])/g, ' $1').trim(), // Basic camelCase to words
      description: gameData.description,
      imageUrl: gameData.imageUrl,
      difficulty: gameData.difficulty,
      gameType: gameData.gameType,
      score: score, // Store score for sorting
    } as RecommendedGame & { score: number });
  }

  // Sort by score (descending) and take the top N
  potentialRecommendations.sort((a, b) => b.score - a.score);
  const finalRecommendations = potentialRecommendations.slice(0, 3);

  setCachedRecommendations(profileId, finalRecommendations, feedback);

  return finalRecommendations;
}
