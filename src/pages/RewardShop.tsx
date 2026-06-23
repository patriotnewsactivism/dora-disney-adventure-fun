import React, { useState, useEffect, useContext } from 'react';
import { GameLayout } from '@/components/GameLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { REWARD_ITEMS, RewardItem } from '@/data/rewards';
import { GameProgressContext } from '@/contexts/GameProgressContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { ProfileContext } from '@/contexts/ProfileContext';

type UserReward = Database['public']['Tables']['user_rewards']['Row'];

const RewardShop = () => {
  const { profile } = useContext(ProfileContext);
  const { stars, refreshStars } = useContext(GameProgressContext);
  const { toast } = useToast();
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hats' | 'accessories' | 'outfits'>('all');

  useEffect(() => {
    if (profile?.id) {
      fetchUserRewards(profile.id);
    }
  }, [profile?.id]);

  const fetchUserRewards = async (profileId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error fetching user rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your purchased items.',
        variant: 'destructive',
      });
    } else {
      setUserRewards(data || []);
    }
    setLoading(false);
  };

  const handlePurchase = async (item: RewardItem) => {
    if (!profile?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to purchase items.',
        variant: 'destructive',
      });
      return;
    }

    if (stars < item.cost) {
      toast({
        title: 'Not enough stars!',
        description: `You need ${item.cost - stars} more stars to buy ${item.name}.`,
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    const previousStars = stars;
    const previousUserRewards = [...userRewards];
    const isAlreadyOwned = userRewards.some(ur => ur.reward_item_id === item.id);

    if (isAlreadyOwned) {
      toast({
        title: 'Already Owned',
        description: `You already own the ${item.name}.`,
        variant: 'default',
      });
      return;
    }

    // Attempt to deduct stars and add reward
    try {
      // Start a transaction-like behavior using a stored procedure or direct updates
      // For simplicity, we'll do two separate calls, but a real transaction would be better.
      // This is where a rollback system would be crucial if one fails.

      // 1. Deduct stars
      const { error: starsError } = await supabase.rpc('deduct_stars', {
        p_profile_id: profile.id,
        p_amount: item.cost,
      });

      if (starsError) {
        throw starsError;
      }

      // 2. Add reward to user_rewards
      const { error: rewardError } = await supabase
        .from('user_rewards')
        .insert({
          profile_id: profile.id,
          reward_item_id: item.id,
          purchased_at: new Date().toISOString(),
        });

      if (rewardError) {
        // If adding reward fails, attempt to rollback stars
        await supabase.rpc('add_stars', {
          p_profile_id: profile.id,
          p_amount: item.cost,
        });
        throw rewardError;
      }

      // If both succeed
      toast({
        title: 'Purchase Successful!',
        description: `You bought the ${item.name} for ${item.cost} stars.`, 
        variant: 'success',
      });
      refreshStars(); // Update stars count
      fetchUserRewards(profile.id); // Refresh owned items

    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'An unexpected error occurred. Stars have been refunded if deducted.',
        variant: 'destructive',
      });
      // Rollback UI if optimistic update was applied
      refreshStars(); // Ensure stars are correct
      setUserRewards(previousUserRewards); // Revert owned items
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? REWARD_ITEMS
    : REWARD_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <GameLayout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">Reward Shop</h1>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="min-w-[120px]"
          >
            All Items
          </Button>
          <Button
            variant={selectedCategory === 'hats' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('hats')}
            className="min-w-[120px]"
          >
            Hats
          </Button>
          <Button
            variant={selectedCategory === 'accessories' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('accessories')}
            className="min-w-[120px]"
          >
            Accessories
          </Button>
          <Button
            variant={selectedCategory === 'outfits' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('outfits')}
            className="min-w-[120px]"
          >
            Outfits
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-lg text-gray-600">Loading items...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isOwned = userRewards.some(ur => ur.reward_item_id === item.id);
              const canAfford = stars >= item.cost;

              return (
                <Card key={item.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="relative p-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {isOwned && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white">Owned</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow p-4">
                    <CardTitle className="text-xl font-semibold mb-2 text-primary">{item.name}</CardTitle>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{item.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        ⭐ {item.cost}
                      </Badge>
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={isOwned || !canAfford}
                        className="min-w-[100px]"
                      >
                        {isOwned ? 'Owned' : canAfford ? 'Buy' : 'Not Enough Stars'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center text-lg text-gray-600">No items in this category.</div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default RewardShop;
