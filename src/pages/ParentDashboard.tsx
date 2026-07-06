import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Gamepad2, TrendingUp, Video, Phone, Settings, Check } from 'lucide-react';
import { createCallSession } from '@/utils/callActions';
import { useToast } from '@/hooks/use-toast';
import { GATE_ICONS, DEFAULT_GATE_CODE } from '@/data/gateIcons';

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

interface IncomingCall {
  slug: string;
  child_name: string | null;
  profile_id: string;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [gamePlays, setGamePlays] = useState<GamePlay[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('all');
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  const [startingCallFor, setStartingCallFor] = useState<string | null>(null);
  const [gateCode, setGateCode] = useState<number[]>(DEFAULT_GATE_CODE as unknown as number[]);
  const [gateDraft, setGateDraft] = useState<number[]>([]);
  const [savingGate, setSavingGate] = useState(false);

  useEffect(() => {
    loadData();
    loadGateCode();

    const channel = supabase
      .channel('parent-incoming-calls')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'video_calls' },
        (payload) => {
          const row = payload.new as any;
          if (row.initiated_by === 'child' && row.status === 'ringing') {
            setIncomingCalls((prev) => [
              { slug: row.slug, child_name: row.child_name, profile_id: row.profile_id },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadGateCode = async () => {
    const { data } = await supabase.from('app_config').select('family_code').eq('id', 1).maybeSingle();
    if (data?.family_code && Array.isArray(data.family_code)) {
      setGateCode(data.family_code as number[]);
    }
  };

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

  const handleStartCall = async (profile: Profile) => {
    setStartingCallFor(profile.id);
    try {
      const slug = await createCallSession({
        profileId: profile.id,
        childName: profile.name,
        initiatedBy: 'parent',
      });
      navigate(`/call/${slug}?role=host&name=Mom%2FDad`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Could not start call', variant: 'destructive' });
      setStartingCallFor(null);
    }
  };

  const joinIncomingCall = (call: IncomingCall) => {
    setIncomingCalls((prev) => prev.filter((c) => c.slug !== call.slug));
    navigate(`/call/${call.slug}?role=guest&name=Mom%2FDad`);
  };

  const dismissIncomingCall = (slug: string) => {
    setIncomingCalls((prev) => prev.filter((c) => c.slug !== slug));
  };

  const handleGateTap = (index: number) => {
    setGateDraft((prev) => (prev.length >= 4 ? [index] : [...prev, index]));
  };

  const saveGateCode = async () => {
    if (gateDraft.length < 2) {
      toast({ title: 'Pick at least 2 pictures', variant: 'destructive' });
      return;
    }
    setSavingGate(true);
    const { error } = await supabase
      .from('app_config')
      .update({ family_code: gateDraft, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setSavingGate(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    setGateCode(gateDraft);
    setGateDraft([]);
    toast({ title: 'Magic password updated! ✨' });
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

        {/* Incoming call banners */}
        {incomingCalls.map((call) => (
          <Card key={call.slug} className="mb-4 p-4 border-primary border-2 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">📹</span>
              <p className="font-semibold text-lg">
                {call.child_name || 'Your kid'} is calling you!
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => joinIncomingCall(call)} className="gap-2">
                <Phone className="h-4 w-4" /> Join Call
              </Button>
              <Button variant="outline" onClick={() => dismissIncomingCall(call.slug)}>
                Dismiss
              </Button>
            </div>
          </Card>
        ))}

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
          <TabsList className="grid w-full grid-cols-5 mb-6">
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
            <TabsTrigger value="video" className="flex gap-2">
              <Video className="w-4 h-4" />
              Video Call
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2">
              <Settings className="w-4 h-4" />
              Settings
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
                            {getProfileName(play.profile_id)} • {format(new Date(play.played_at), 'MMM d, h:mm a')}
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

          <TabsContent value="video">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-2">Start a Video Call</h2>
              <p className="text-muted-foreground mb-6">
                Tap a kid to ring their tablet instantly — they'll get a big "Answer" screen, no link or typing needed on their end.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {profiles.map((profile) => (
                  <Button
                    key={profile.id}
                    onClick={() => handleStartCall(profile)}
                    disabled={startingCallFor === profile.id}
                    className="h-24 text-lg gap-2 flex-col"
                    variant="secondary"
                  >
                    <Video className="h-6 w-6" />
                    {startingCallFor === profile.id ? 'Calling...' : `Call ${profile.name}`}
                  </Button>
                ))}
              </div>
              {profiles.length === 0 && (
                <p className="text-muted-foreground">No kid profiles found yet.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-2">Kids' Magic Password</h2>
              <p className="text-muted-foreground mb-4">
                This is the picture sequence your kids tap to get into the app on any device. Current password is {gateCode.length} picture{gateCode.length === 1 ? '' : 's'} long.
                Tap a new sequence below (2–4 pictures) and save to change it everywhere.
              </p>

              <div className="flex gap-2 mb-4">
                {gateDraft.map((i, idx) => (
                  <div key={idx} className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl border">
                    {GATE_ICONS[i]?.emoji}
                  </div>
                ))}
                {gateDraft.length === 0 && (
                  <p className="text-sm text-muted-foreground py-3">Tap pictures below to build the new password...</p>
                )}
              </div>

              <div className="grid grid-cols-5 gap-3 max-w-md mb-4">
                {GATE_ICONS.map((icon, i) => (
                  <button
                    key={icon.id}
                    onClick={() => handleGateTap(i)}
                    className="h-14 w-14 rounded-xl bg-card border-2 border-border flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveGateCode} disabled={savingGate || gateDraft.length < 2} className="gap-2">
                  <Check className="h-4 w-4" /> {savingGate ? 'Saving...' : 'Save New Password'}
                </Button>
                {gateDraft.length > 0 && (
                  <Button variant="outline" onClick={() => setGateDraft([])}>
                    Clear
                  </Button>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
