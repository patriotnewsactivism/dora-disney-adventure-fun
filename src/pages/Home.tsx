import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Grid3x3, Pencil, CircleDot, Palette, MessageCircle, Users } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import ProgressMap from "@/components/ProgressMap";
import { useGameProgress } from "@/contexts/GameProgressContext";
import { useEffect, useState } from "react";
import { getRecommendations } from "@/utils/gameRecommendations";

const Home = () => {
  const { currentProfile } = useProfile();
  const { gameCompletions } = useGameProgress();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (currentProfile) {
        const recs = await getRecommendations(currentProfile);
        setRecommendations(recs);
      }
    };
    fetchRecommendations();
  }, [currentProfile]);

  const allGames = [
    // ... (existing game list remains unchanged)
  ];

  // Filter games based on current profile age
  const games = currentProfile 
    ? allGames.filter(game => currentProfile.age >= game.minAge)
    : allGames;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 text-primary animate-bounce">
              ð® Disney Games Hub! ð®
            </h1>
            {currentProfile && (
              <p className="text-2xl text-muted-foreground">
                Welcome back, {currentProfile.name}! ð
              </p>
            )}
            <p className="text-xl text-muted-foreground">
              Choose your favorite game to play!
            </p>
          </div>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg">
              <Users className="mr-2 h-5 w-5" />
              Switch Player
            </Button>
          </Link>
        </div>

        <ProgressMap games={games} gameCompletions={gameCompletions} />

        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => {
                const game = allGames.find(g => g.id === rec.gameId);
                if (!game) return null;
                return (
                  <Card key={rec.gameId} className="p-4">
                    <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                    <Button variant="outline" className="mr-2">Play Now</Button>
                    <Button variant="ghost">Not Interested</Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Link key={game.id} to={game.path}>
                <Card className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer border-4 border-border hover:shadow-2xl">
                  <div className={`${game.color} rounded-2xl p-8 mb-4 flex items-center justify-center`}>
                    <Icon className="h-20 w-20 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-center mb-2 text-foreground">
                    {game.title}
                  </h2>
                  <p className="text-lg text-center text-muted-foreground">
                    {game.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;