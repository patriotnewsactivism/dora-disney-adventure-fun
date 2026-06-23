import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './ProfileContext';
import { Tables } from '@/integrations/supabase/types';

type Achievement = Tables<'achievements'>;
type GameCompletion = Tables<'game_completions'>;

interface GameProgressContextType {
  achievements: Achievement[];
  gameCompletions: GameCompletion[];
  loading: boolean;
  error: string | null;
  trackAchievement: (achievementId: string, progressIncrement?: number, unlockThreshold?: number) => Promise<void>;
  trackGameCompletion: (gameId: string, score?: number) => Promise<void>;
  getAchievementProgress: (achievementId: string) => number;
  isAchievementUnlocked: (achievementId: string) => boolean;
}

const GameProgressContext = createContext<GameProgressContextType | undefined>(undefined);

export const GameProgressProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useProfile();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gameCompletions, setGameCompletions] = useState<GameCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async (profileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', profileId);

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      const { data: gameCompletionsData, error: gameCompletionsError } = await supabase
        .from('game_completions')
        .select('*')
        .eq('profile_id', profileId);

      if (gameCompletionsError) throw gameCompletionsError;
      setGameCompletions(gameCompletionsData || []);

    } catch (err) {
      console.error('Error fetching game progress:', err);
      setError('Failed to load game progress.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.id) {
      fetchProgress(profile.id);
    }
  }, [profile?.id, fetchProgress]);

  const trackAchievement = useCallback(async (achievementId: string, progressIncrement: number = 1, unlockThreshold: number = 1) => {
    if (!profile?.id) {
      console.warn('No profile ID available to track achievement.');
      return;
    }

    try {
      // Check if achievement exists for this profile
      const { data: existingAchievement, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('achievement_id', achievementId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is expected for new achievements
        throw fetchError;
      }

      let newProgress = existingAchievement ? existingAchievement.progress + progressIncrement : progressIncrement;
      let unlockedAt = existingAchievement?.unlocked_at;

      if (!unlockedAt && newProgress >= unlockThreshold) {
        unlockedAt = new Date().toISOString();
        console.log(`Achievement '${achievementId}' unlocked for profile ${profile.id}!`);
        // TODO: Trigger a notification/animation for unlock
      }

      if (existingAchievement) {
        // Update existing achievement
        const { data, error } = await supabase
          .from('achievements')
          .update({ progress: newProgress, unlocked_at: unlockedAt, updated_at: new Date().toISOString() })
          .eq('id', existingAchievement.id)
          .select()
          .single();
        if (error) throw error;
        setAchievements(prev => prev.map(a => (a.id === data.id ? data : a)));
      } else {
        // Insert new achievement
        const { data, error } = await supabase
          .from('achievements')
          .insert({
            profile_id: profile.id,
            achievement_id: achievementId,
            progress: newProgress,
            unlocked_at: unlockedAt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        setAchievements(prev => [...prev, data]);
      }
    } catch (err) {
      console.error('Error tracking achievement:', err);
      setError('Failed to track achievement.');
    }
  }, [profile?.id]);

  const trackGameCompletion = useCallback(async (gameId: string, score: number | null = null) => {
    if (!profile?.id) {
      console.warn('No profile ID available to track game completion.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_completions')
        .insert({
          profile_id: profile.id,
          game_id: gameId,
          score: score,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setGameCompletions(prev => [...prev, data]);
      console.log(`Game '${gameId}' completed by profile ${profile.id}.`);
    } catch (err) {
      console.error('Error tracking game completion:', err);
      setError('Failed to track game completion.');
    }
  }, [profile?.id]);

  const getAchievementProgress = useCallback((achievementId: string): number => {
    return achievements.find(a => a.achievement_id === achievementId)?.progress || 0;
  }, [achievements]);

  const isAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return achievements.some(a => a.achievement_id === achievementId && a.unlocked_at !== null);
  }, [achievements]);

  const value = {
    achievements,
    gameCompletions,
    loading,
    error,
    trackAchievement,
    trackGameCompletion,
    getAchievementProgress,
    isAchievementUnlocked,
  };

  return (
    <GameProgressContext.Provider value={value}>
      {children}
    </GameProgressContext.Provider>
  );
};

export const useGameProgress = () => {
  const context = useContext(GameProgressContext);
  if (context === undefined) {
    throw new Error('useGameProgress must be used within a GameProgressProvider');
  }
  return context;
};