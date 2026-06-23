import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MessageSquare, Gamepad2, TrendingUp } from 'lucide-react';

interface ConversationMessage {
  id: string;
  profile_id: string;
  character: string;
  role: string;
  content: string;
  audio_transcript: string | null;
  created_at: string;
}

interface GamePlay {
  id: string;
  profile_id: string;
  game_type: string;
  score: number | null;
  played_at: string;
  completed_at: string | null;
}

interface Profile {
  id: string;
  name: string;
  age: number;
}

const ParentDashboard = () => {
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [gamePlays, setGamePlays] = useState<GamePlay[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('age', { ascending: false });
    
    if (profilesData) setProfiles(profilesData);

    // Load conversations
    const { data: conversationsData } = await supabase
      .from('conversation_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    
    if (conversationsData) setConversations(conversationsData);

    // Load game plays
    const { data: gamePlaysData } = await supabase
      .from('game_progress')
      .select('*')
      .order('played_at', { ascending: false })
      .limit(200);
    
    if (gamePlaysData) setGamePlays(gamePlaysData);
  };

  const getProfileName = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.name || 'Unknown';
  };

  const filteredConversations = selectedProfile === 'all' 
    ? conversations 
    : conversations.filter(c => c.profile_id === selectedProfile);

  const filteredGamePlays = selectedProfile === 'all'
    ? gamePlays
    : gamePlays.filter(g => g.profile_id === selectedProfile);

  const getGameStats = () => {
    const stats: Record<string, number> = {};
    filteredGamePlays.forEach(play => {
      stats[play.game_type] = (stats[play.game_type] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Parent Dashboard
          </h1>
          <p className="text-muted-foreground">Track your children's learning and activities</p>
        </div>

        {/* Profile Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Badge 
            variant={selectedProfile === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedProfile('all')}
          >
            All Kids
          </Badge>
          {profiles.map(profile => (
            <Badge
              key={profile.id}
              variant={selectedProfile === profile.id ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedProfile(profile.id)}
            >
              {profile.name}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="conversations" className="flex gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="games" className="flex gap-2">
              <Gamepad2 className="w-4 h-4" />
              Game History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Chat History with Disney Characters</h2>
              <ScrollArea className="h-[600px] pr-4">
                {filteredConversations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No conversations yet</p>
                ) : (
                  <div className="space-y-4">
                    {filteredConversations.map((msg) => (
                      <div key={msg.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                              {msg.role === 'user' ? getProfileName(msg.profile_id) : msg.character}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
                        {msg.audio_transcript && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Audio: {msg.audio_transcript}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="games">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Game Play History</h2>
              <ScrollArea className="h-[600px] pr-4">
                {filteredGamePlays.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No games played yet</p>
                ) : (
                  <div className="space-y-3">
                    {filteredGamePlays.map((play) => (
                      <div key={play.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{play.game_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {getProfileName(play.profile_id)} â¢ {format(new Date(play.played_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        {play.score !== null && (
                          <Badge variant="outline" className="text-lg">
                            Score: {play.score}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Most Played Games</h2>
                <div className="space-y-3">
                  {getGameStats().map(([game, count]) => (
                    <div key={game} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">{game}</span>
                      <Badge>{count} plays</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Activity Summary</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Conversations</p>
                    <p className="text-3xl font-bold">{filteredConversations.length}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Games Played</p>
                    <p className="text-3xl font-bold">{filteredGamePlays.length}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Kids</p>
                    <p className="text-3xl font-bold">{profiles.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
