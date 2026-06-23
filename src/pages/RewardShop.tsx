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

type UserReward = Database['public']['Tables']['rewards_transactions']['Row'];

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
      .from('rewards_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('transaction_status', 'completed');

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

    const isAlreadyOwned = userRewards.some(ur => ur.reward_id === item.id);
    if (isAlreadyOwned) {
      toast({
        title: 'Already Owned',
        description: `You already own the ${item.name}.`,
        variant: 'default',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('rewards_transactions')
        .insert({
          profile_id: profile.id,
          reward_id: item.id,
          stars_spent: item.cost,
          transaction_status: 'completed',
        });

      if (error) throw error;

      toast({
        title: 'Purchase Successful! 🎉',
        description: `You bought ${item.name} for ${item.cost} stars!`,
      });

      await fetchUserRewards(profile.id);
      if (refreshStars) refreshStars();
    } catch (err) {
      console.error('Purchase error:', err);
      toast({
        title: 'Purchase Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? REWARD_ITEMS
    : REWARD_ITEMS.filter(item => item.category === selectedCategory);

  const categories: Array<{ value: 'all' | 'hats' | 'accessories' | 'outfits'; label: string }> = [
    { value: 'all', label: 'All Items' },
    { value: 'hats', label: '🎩 Hats' },
    { value: 'accessories', label: '✨ Accessories' },
    { value: 'outfits', label: '👕 Outfits' },
  ];

  return (
    <GameLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-purple-700">🛍️ Reward Shop</h1>
          <div className="flex items-center gap-2 bg-yellow-100 rounded-full px-4 py-2">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-bold text-yellow-700">{stars ?? 0}</span>
            <span className="text-sm text-yellow-600">stars</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading shop...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const isOwned = userRewards.some(ur => ur.reward_id === item.id);
              const canAfford = (stars ?? 0) >= item.cost;

              return (
                <Card
                  key={item.id}
                  className={`relative transition-all ${isOwned ? 'border-green-400 bg-green-50' : ''}`}
                >
                  {isOwned && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                      Owned ✓
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">⭐</span>
                        <span className="font-bold text-yellow-700">{item.cost}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={isOwned || !canAfford}
                        onClick={() => handlePurchase(item)}
                        className={isOwned ? 'bg-green-500' : !canAfford ? 'opacity-50' : ''}
                      >
                        {isOwned ? 'Owned' : !canAfford ? 'Need more ⭐' : 'Buy'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default RewardShop;
