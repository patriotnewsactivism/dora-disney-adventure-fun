import React, { useState, useEffect, useContext, useCallback } from 'react';
import MemoryGame from './MemoryGame';
import { supabase } from '@/integrations/supabase/client';
import { ProfileContext } from '@/contexts/ProfileContext';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

type MemoryGameSession = Tables<'memory_game_sessions'>;

interface GameState {
  cards: { id: number; value: string; isFlipped: boolean; isMatched: boolean }[];
  flippedCards: number[];
  matchedPairs: number;
  playerScores: { [playerId: string]: number };
  currentPlayerIndex: number;
  turnCount: number;
}

const MultiplayerMemory: React.FC = () => {
  const { profile } = useContext(ProfileContext);
  const [gameId, setGameId] = useState<string | null>(null);
  const [lobbyGameId, setLobbyGameId] = useState<string>('');
  const [session, setSession] = useState<MemoryGameSession | null>(null);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const userId = profile?.id;

  const fetchPlayerProfiles = useCallback(async (playerIds: string[]) => {
    if (playerIds.length === 0) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', playerIds);

    if (error) {
      console.error('Error fetching player profiles:', error);
      return [];
    }
    return data || [];
  }, []);

  const createGame = async () => {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in to create a game.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('memory_game_sessions')
        .insert({
          host_id: userId,
          player_ids: [userId],
          status: 'lobby',
          is_active: true,
          game_state: {},
          player_scores: { [userId]: 0 },
        })
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      setGameId(data.game_id);
      setPlayers([{ id: userId, name: profile?.name || 'You' }]);
      toast({ title: 'Game Created', description: `Game ID: ${data.game_id}` });
    } catch (err: any) {
      console.error('Error creating game:', err.message);
      setError(`Failed to create game: ${err.message}`);
      toast({ title: 'Error', description: `Failed to create game: ${err.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async () => {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in to join a game.', variant: 'destructive' });
      return;
    }
    if (!lobbyGameId) {
      toast({ title: 'Error', description: 'Please enter a Game ID.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch the existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from('memory_game_sessions')
        .select('*')
        .eq('game_id', lobbyGameId)
        .single();

      if (fetchError || !existingSession) throw new Error('Game not found or an error occurred.');
      if (existingSession.status !== 'lobby') throw new Error('Game has already started or ended.');
      if (existingSession.player_ids?.includes(userId)) {
        // Already in the game, just set the session and gameId
        setSession(existingSession);
        setGameId(existingSession.game_id);
        const fetchedPlayers = await fetchPlayerProfiles(existingSession.player_ids || []);
        setPlayers(fetchedPlayers);
        toast({ title: 'Joined Game', description: `Rejoined Game ID: ${existingSession.game_id}` });
        return;
      }

      const updatedPlayerIds = [...(existingSession.player_ids || []), userId];
      const updatedPlayerScores = { ...((existingSession.player_scores as { [key: string]: number }) || {}), [userId]: 0 };

      const { data, error } = await supabase
        .from('memory_game_sessions')
        .update({
          player_ids: updatedPlayerIds,
          player_scores: updatedPlayerScores,
        })
        .eq('game_id', lobbyGameId)
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      setGameId(data.game_id);
      const fetchedPlayers = await fetchPlayerProfiles(data.player_ids || []);
      setPlayers(fetchedPlayers);
      toast({ title: 'Joined Game', description: `Joined Game ID: ${data.game_id}` });
    } catch (err: any) {
      console.error('Error joining game:', err.message);
      setError(`Failed to join game: ${err.message}`);
      toast({ title: 'Error', description: `Failed to join game: ${err.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!session || !userId || session.host_id !== userId) {
      toast({ title: 'Error', description: 'Only the host can start the game.', variant: 'destructive' });
      return;
    }
    if (!session.player_ids || session.player_ids.length < 2) {
      toast({ title: 'Error', description: 'Need at least 2 players to start the game.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Initialize game state (e.g., cards, initial player turn)
      const initialGameState: GameState = {
        cards: [], // Will be initialized by MemoryGame component
        flippedCards: [],
        matchedPairs: 0,
        playerScores: session.player_scores as { [playerId: string]: number },
        currentPlayerIndex: 0,
        turnCount: 0,
      };

      const { data, error } = await supabase
        .from('memory_game_sessions')
        .update({
          status: 'in_progress',
          game_state: initialGameState,
          current_player_id: session.player_ids[0], // First player's turn
        })
        .eq('game_id', session.game_id)
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      toast({ title: 'Game Started', description: 'The game has begun!' });
    } catch (err: any) {
      console.error('Error starting game:', err.message);
      setError(`Failed to start game: ${err.message}`);
      toast({ title: 'Error', description: `Failed to start game: ${err.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`memory_game_session:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'memory_game_sessions', filter: `game_id=eq.${gameId}` },
        (payload) => {
          const updatedSession = payload.new as MemoryGameSession;
          setSession(updatedSession);
          if (updatedSession.player_ids) {
            fetchPlayerProfiles(updatedSession.player_ids).then(setPlayers);
          }
          if (updatedSession.status === 'in_progress' && updatedSession.game_state) {
            // Game started, potentially navigate or update UI
            toast({ title: 'Game Update', description: 'Game state updated!' });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, fetchPlayerProfiles, toast]);

  // Handle initial load if already in a game (e.g., page refresh)
  useEffect(() => {
    const checkExistingGame = async () => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('memory_game_sessions')
        .select('*')
        .contains('player_ids', [userId])
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSession(data);
        setGameId(data.game_id);
        if (data.player_ids) {
          const fetchedPlayers = await fetchPlayerProfiles(data.player_ids);
          setPlayers(fetchedPlayers);
        }
        toast({ title: 'Welcome Back!', description: `Rejoined active game: ${data.game_id}` });
      } else if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error checking existing game:', error);
      }
      setLoading(false);
    };
    checkExistingGame();
  }, [userId, fetchPlayerProfiles, toast]);

  const handleGameUpdate = useCallback(async (newGameState: GameState) => {
    if (!session || !userId || session.current_player_id !== userId) {
      // Only the current player can update the game state
      return;
    }

    const nextPlayerIndex = (newGameState.currentPlayerIndex + 1) % (session.player_ids?.length || 1);
    const nextPlayerId = session.player_ids?.[nextPlayerIndex] || null;

    const { error } = await supabase
      .from('memory_game_sessions')
      .update({
        game_state: newGameState,
        player_scores: newGameState.playerScores,
        current_player_id: nextPlayerId,
      })
      .eq('game_id', session.game_id);

    if (error) {
      console.error('Error updating game state:', error);
      toast({ title: 'Error', description: 'Failed to update game state.', variant: 'destructive' });
    }
  }, [session, userId, toast]);

  const handleGameEnd = useCallback(async (finalScores: { [playerId: string]: number }) => {
    if (!session || !userId || session.host_id !== userId) return; // Only host can finalize game

    setLoading(true);
    try {
      const { error } = await supabase
        .from('memory_game_sessions')
        .update({
          status: 'completed',
          is_active: false,
          player_scores: finalScores,
          current_player_id: null,
        })
        .eq('game_id', session.game_id);

      if (error) throw error;
      toast({ title: 'Game Over', description: 'The game has ended!' });
    } catch (err: any) {
      console.error('Error ending game:', err.message);
      toast({ title: 'Error', description: `Failed to end game: ${err.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [session, userId, toast]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-lg text-red-500">Error: {error}</div>;
  }

  if (!session || session.status === 'lobby') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-100 to-blue-100">
        <Card className="w-full max-w-md shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-purple-700">Multiplayer Memory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button onClick={createGame} className="w-full py-3 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-md" disabled={loading}>
                {loading ? 'Creating...' : 'Create New Game'}
              </Button>
            </div>
            <div className="relative flex items-center">
              <hr className="flex-grow border-gray-300" />
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter Game ID to Join"
                value={lobbyGameId}
                onChange={(e) => setLobbyGameId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <Button onClick={joinGame} className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md" disabled={loading || !lobbyGameId}>
                {loading ? 'Joining...' : 'Join Game'}
              </Button>
            </div>

            {session && (
              <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Lobby: {session.game_id}</h3>
                <p className="text-gray-600 mb-2">Host: {players.find(p => p.id === session.host_id)?.name || 'Unknown'}</p>
                <h4 className="font-medium mb-2 text-gray-700">Players ({players.length}):</h4>
                <ul className="space-y-1">
                  {players.map((player) => (
                    <li key={player.id} className="flex items-center gap-2">
                      <Badge variant={player.id === userId ? 'default' : 'secondary'}>
                        {player.name} {player.id === userId && '(You)'}
                      </Badge>
                      {player.id === session.host_id && <Badge variant="outline">Host</Badge>}
                    </li>
                  ))}
                </ul>
                {session.host_id === userId && ( // Only host can start the game
                  <Button
                    onClick={startGame}
                    className="mt-6 w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md"
                    disabled={loading || players.length < 2}
                  >
                    Start Game
                  </Button>
                )}
                {session.host_id !== userId && (
                  <p className="mt-4 text-center text-gray-600">Waiting for the host to start the game...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game is in progress
  const currentGameState = session.game_state as GameState;
  const currentPlayer = players.find(p => p.id === session.current_player_id);
  const isMyTurn = userId === session.current_player_id;

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-3xl font-bold mb-4 text-purple-700">Game ID: {session.game_id}</h2>
      <div className="flex flex-wrap justify-center gap-4 mb-6 w-full max-w-4xl">
        {players.map((player) => (
          <Badge
            key={player.id}
            variant={player.id === session.current_player_id ? 'default' : 'secondary'}
            className={`p-3 text-base ${player.id === session.current_player_id ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
          >
            {player.name} {player.id === userId && '(You)'} - Score: {(session.player_scores as { [key: string]: number })?.[player.id] || 0}
            {player.id === session.current_player_id && <span className="ml-2 animate-pulse">🎲 Your Turn!</span>}
          </Badge>
        ))}
      </div>

      {session.status === 'in_progress' && currentGameState && (
        <MemoryGame
          initialCards={currentGameState.cards.length > 0 ? currentGameState.cards : undefined}
          onGameUpdate={handleGameUpdate}
          onGameEnd={handleGameEnd}
          isMultiplayer={true}
          multiplayerState={currentGameState}
          currentPlayerId={userId}
          isMyTurn={isMyTurn}
          playerScores={session.player_scores as { [playerId: string]: number }}
          playerIds={session.player_ids || []}
        />
      )}

      {session.status === 'completed' && (
        <Card className="w-full max-w-md mt-8 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-700">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Final Scores:</h3>
            <ul className="space-y-2">
              {Object.entries(session.player_scores as { [key: string]: number } || {}).sort(([, scoreA], [, scoreB]) => scoreB - scoreA).map(([playerId, score]) => {
                const playerName = players.find(p => p.id === playerId)?.name || 'Unknown';
                return (
                  <li key={playerId} className="flex justify-between items-center text-lg">
                    <span>{playerName} {playerId === userId && '(You)'}</span>
                    <Badge variant="default" className="text-lg p-2">{score}</Badge>
                  </li>
                );
              })}
            </ul>
            <Button onClick={() => navigate('/')} className="w-full py-3 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-md">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiplayerMemory;
