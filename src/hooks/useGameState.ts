import { useEffect, useState } from 'react';
import { saveGameState, loadGameState, cleanupGameState } from '../utils/gameState';
import { useToast } from '../components/ui/use-toast';

interface UseGameStateOptions {
  gameId: string;
  initialState: any;
}

export function useGameState({ gameId, initialState }: UseGameStateOptions) {
  const [state, setState] = useState(() => loadGameState(gameId) || initialState);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      const success = saveGameState(gameId, state);
      if (success) {
        toast({
          title: 'Game saved!',
          duration: 1000,
        });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [gameId, state, toast]);

  useEffect(() => {
    return () => {
      cleanupGameState(gameId);
    };
  }, [gameId]);

  return [state, setState];
}