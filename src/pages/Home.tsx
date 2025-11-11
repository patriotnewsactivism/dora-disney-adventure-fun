import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Grid3x3, Pencil, CircleDot, Palette, MessageCircle, User } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

const Home = () => {
  const { currentProfile } = useProfile();
  
  const allGames = [
    {
      id: "memory",
      title: "Memory Match",
      description: "Find matching character pairs!",
      icon: Brain,
      path: "/memory",
      color: "bg-gradient-to-br from-pink-400 to-purple-500",
      minAge: 4,
    },
    {
      id: "tictactoe",
      title: "Tic-Tac-Toe",
      description: "Play with Disney characters!",
      icon: Grid3x3,
      path: "/tictactoe",
      color: "bg-gradient-to-br from-blue-400 to-cyan-500",
      minAge: 5,
    },
    {
      id: "hangman",
      title: "Hangman",
      description: "Guess the Disney words!",
      icon: Pencil,
      path: "/hangman",
      color: "bg-gradient-to-br from-green-400 to-emerald-500",
      minAge: 6,
    },
    {
      id: "checkers",
      title: "Checkers",
      description: "Classic checkers game!",
      icon: CircleDot,
      path: "/checkers",
      color: "bg-gradient-to-br from-red-400 to-orange-500",
      minAge: 6,
    },
    {
      id: "coloring",
      title: "Color by Number",
      description: "Create beautiful art!",
      icon: Palette,
      path: "/coloring",
      color: "bg-gradient-to-br from-yellow-400 to-amber-500",
      minAge: 3,
    },
    {
      id: "aichat",
      title: "Disney AI Friend",
      description: "Chat with your AI buddy!",
      icon: MessageCircle,
      path: "/aichat",
      color: "bg-gradient-to-br from-purple-400 to-pink-500",
      minAge: 3,
    },
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
              🎮 Disney Games Hub! 🎮
            </h1>
            {currentProfile && (
              <p className="text-2xl text-muted-foreground">
                Welcome back, {currentProfile.name}! 🌟
              </p>
            )}
            <p className="text-xl text-muted-foreground">
              Choose your favorite game to play!
            </p>
          </div>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg">
              <User className="mr-2 h-5 w-5" />
              Switch Player
            </Button>
          </Link>
        </div>

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
