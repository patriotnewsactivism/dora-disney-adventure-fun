import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Home, Share2 } from 'lucide-react';
import { allAchievements, Achievement } from '../data/achievements';
import { supabase } from '../integrations/supabase/client';
import { ProfileContext } from '../contexts/ProfileContext';
import { Tables } from '../integrations/supabase/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useToast } from '../components/ui/use-toast';

const AchievementGallery: React.FC = () => {
  const { profile } = useContext(ProfileContext);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAchievements = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', profile.id);

      if (error) {
        console.error('Error fetching user achievements:', error);
        return;
      }

      const fetchedAchievementsMap = new Map<string, Tables<'achievements'>['Row']>();
      data.forEach(ua => fetchedAchievementsMap.set(ua.achievement_id, ua));

      const mergedAchievements = allAchievements.map(ach => {
        const userAch = fetchedAchievementsMap.get(ach.id);
        return {
          ...ach,
          unlocked: userAch?.unlocked || false,
          currentProgress: userAch?.current_progress || 0,
          unlockedAt: userAch?.unlocked_at || null,
        };
      });
      setUserAchievements(mergedAchievements);
    };

    fetchUserAchievements();
  }, [profile]);

  const handleShare = async (achievement: Achievement) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Achievement: ${achievement.name}`,
          text: `I just earned the achievement '${achievement.name}' in Disney Kids! ${achievement.description}`,
          url: window.location.href, // Share the current page URL
        });
        toast({
          title: 'Achievement Shared!',
          description: `${achievement.name} has been shared.`, 
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          title: 'Sharing Failed',
          description: 'Could not share the achievement.',
          variant: 'destructive',
        });
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      navigator.clipboard.writeText(`I just earned the achievement '${achievement.name}' in Disney Kids! ${achievement.description} - Check it out: ${window.location.href}`);
      toast({
        title: 'Link Copied!',
        description: 'Achievement details copied to clipboard. You can paste it anywhere!',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Achievement Gallery</h1>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userAchievements.length === 0 ? (
            <p className="col-span-full text-center text-lg text-gray-600">No achievements unlocked yet. Keep playing!</p>
          ) : (
            userAchievements.map((achievement) => (
              <Card key={achievement.id} className={`flex flex-col h-full ${achievement.unlocked ? 'border-green-500 shadow-lg' : 'border-gray-300 opacity-70'}`}>
                <CardHeader className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl" aria-label={`Achievement: ${achievement.name}`}>{achievement.icon} {achievement.name}</CardTitle>
                    {achievement.unlocked && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShare(achievement)}
                              aria-label={`Share ${achievement.name} achievement`}
                              className="w-10 h-10"
                            >
                              <Share2 className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Share Achievement</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <CardDescription className="text-gray-600" aria-label={`Description: ${achievement.description}`}>
                    {achievement.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow-0">
                  {achievement.unlocked ? (
                    <p className="text-sm text-green-600 font-semibold" aria-label={`Unlocked on ${new Date(achievement.unlockedAt!).toLocaleDateString()}`}>
                      Unlocked on: {new Date(achievement.unlockedAt!).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500" aria-label={`Progress: ${achievement.currentProgress || 0} out of ${achievement.target || 'N/A'}`}>
                      Progress: {achievement.currentProgress || 0}{achievement.target ? `/${achievement.target}` : ''}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="mt-auto">
                  {achievement.unlocked ? (
                    <span className="text-sm font-medium text-green-700" aria-label="Status: Unlocked">Status: Unlocked</span>
                  ) : (
                    <span className="text-sm font-medium text-gray-500" aria-label="Status: Locked">Status: Locked</span>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementGallery;
