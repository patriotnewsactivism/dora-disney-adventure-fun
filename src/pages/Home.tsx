import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Grid3x3, Pencil, CircleDot, Palette, MessageCircle, Users } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

const Home = () => {
  const { currentProfile } = useProfile();
  const navigate = useNavigate();
  
  const allGames = [
    // Original Games
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

    // Ethan's Games (Age 3)
    {
      id: "monster-truck",
      title: "Monster Truck Racing",
      description: "Tap to race big trucks!",
      icon: Brain,
      path: "/monster-truck-racing",
      color: "bg-gradient-to-br from-orange-500 to-red-600",
      minAge: 3,
    },
    {
      id: "spiderman",
      title: "Spider-Man Web Swing",
      description: "Swing through the city!",
      icon: Brain,
      path: "/spiderman-web-sling",
      color: "bg-gradient-to-br from-red-500 to-blue-600",
      minAge: 3,
    },
    {
      id: "big-wheels",
      title: "Big Wheels Stunt",
      description: "Dodge obstacles on your bike!",
      icon: Brain,
      path: "/big-wheels-stunt",
      color: "bg-gradient-to-br from-cyan-400 to-blue-500",
      minAge: 3,
    },

    // All Ages Games
    {
      id: "whack-a-mole",
      title: "Whack-a-Character",
      description: "Tap the characters fast!",
      icon: Grid3x3,
      path: "/whack-a-mole",
      color: "bg-gradient-to-br from-yellow-400 to-orange-500",
      minAge: 3,
    },
    {
      id: "balloon-pop",
      title: "Balloon Pop",
      description: "Pop colorful balloons!",
      icon: CircleDot,
      path: "/balloon-pop",
      color: "bg-gradient-to-br from-pink-400 to-rose-500",
      minAge: 3,
    },
    {
      id: "simon-says",
      title: "Simon Says",
      description: "Remember the pattern!",
      icon: Brain,
      path: "/simon-says",
      color: "bg-gradient-to-br from-purple-400 to-indigo-500",
      minAge: 4,
    },
    {
      id: "puzzle-slide",
      title: "Puzzle Slide",
      description: "Slide tiles to solve!",
      icon: Grid3x3,
      path: "/puzzle-slide",
      color: "bg-gradient-to-br from-teal-400 to-cyan-500",
      minAge: 5,
    },
    {
      id: "drawing-pad",
      title: "Drawing Pad",
      description: "Create amazing art!",
      icon: Palette,
      path: "/drawing-pad",
      color: "bg-gradient-to-br from-rose-400 to-pink-500",
      minAge: 3,
    },
    {
      id: "music-maker",
      title: "Music Maker",
      description: "Compose your own songs!",
      icon: Brain,
      path: "/music-maker",
      color: "bg-gradient-to-br from-violet-400 to-purple-500",
      minAge: 4,
    },

    // Educational Games
    {
      id: "counting",
      title: "Counting Fun",
      description: "Learn to count objects!",
      icon: Brain,
      path: "/counting-game",
      color: "bg-gradient-to-br from-green-400 to-emerald-500",
      minAge: 3,
    },
    {
      id: "letter-tracing",
      title: "Letter Tracing",
      description: "Practice writing letters!",
      icon: Pencil,
      path: "/letter-tracing",
      color: "bg-gradient-to-br from-blue-400 to-indigo-500",
      minAge: 4,
    },
    {
      id: "shape-sorter",
      title: "Shape Sorter",
      description: "Match shapes together!",
      icon: Grid3x3,
      path: "/shape-sorter",
      color: "bg-gradient-to-br from-amber-400 to-yellow-500",
      minAge: 3,
    },
    {
      id: "storytime",
      title: "Interactive Storytime",
      description: "Choose your adventure!",
      icon: MessageCircle,
      path: "/storytime",
      color: "bg-gradient-to-br from-indigo-400 to-blue-500",
      minAge: 4,
    },

    // Imagination & Role-Play
    {
      id: "princess-academy",
      title: "Princess Academy",
      description: "Train to be a princess!",
      icon: Brain,
      path: "/princess-academy",
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      minAge: 5,
    },
    {
      id: "pixie-hollow",
      title: "Pixie Hollow",
      description: "Fairy adventures await!",
      icon: Brain,
      path: "/pixie-hollow",
      color: "bg-gradient-to-br from-green-400 to-lime-500",
      minAge: 5,
    },
    {
      id: "frozen-quest",
      title: "Frozen Ice Quest",
      description: "Find Elsa's snowflakes!",
      icon: Brain,
      path: "/frozen-ice-quest",
      color: "bg-gradient-to-br from-cyan-400 to-blue-500",
      minAge: 5,
    },
    {
      id: "encanto-mystery",
      title: "Encanto Mystery Doors",
      description: "Discover magical gifts!",
      icon: Grid3x3,
      path: "/encanto-mystery",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600",
      minAge: 6,
    },
    {
      id: "ariel-treasure",
      title: "Ariel's Treasure Hunt",
      description: "Find human treasures!",
      icon: Brain,
      path: "/ariel-treasure",
      color: "bg-gradient-to-br from-blue-500 to-teal-600",
      minAge: 5,
    },

    // Creative & Craft
    {
      id: "build-kingdom",
      title: "Build a Kingdom",
      description: "Design your castle!",
      icon: Palette,
      path: "/build-kingdom",
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      minAge: 6,
    },
    {
      id: "dress-designer",
      title: "Dress Designer",
      description: "Create beautiful gowns!",
      icon: Palette,
      path: "/dress-designer",
      color: "bg-gradient-to-br from-rose-400 to-pink-500",
      minAge: 6,
    },
    {
      id: "zootopia-detective",
      title: "Zootopia Detective",
      description: "Solve the mystery!",
      icon: Brain,
      path: "/zootopia-detective",
      color: "bg-gradient-to-br from-orange-500 to-amber-600",
      minAge: 7,
    },
    {
      id: "magic-carpet",
      title: "Magic Carpet",
      description: "Fly through obstacles!",
      icon: CircleDot,
      path: "/magic-carpet",
      color: "bg-gradient-to-br from-violet-500 to-purple-600",
      minAge: 6,
    },
    {
      id: "wish-star",
      title: "Wish Star Workshop",
      description: "Make magical wishes!",
      icon: Brain,
      path: "/wish-star",
      color: "bg-gradient-to-br from-yellow-400 to-amber-500",
      minAge: 5,
    },

    // Musical & Performance
    {
      id: "sing-along",
      title: "Sing-Along Storytime",
      description: "Sing Disney songs!",
      icon: MessageCircle,
      path: "/sing-along",
      color: "bg-gradient-to-br from-pink-500 to-red-600",
      minAge: 5,
    },
    {
      id: "under-sea-dance",
      title: "Under the Sea Dance",
      description: "Dance and freeze!",
      icon: CircleDot,
      path: "/under-sea-dance",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      minAge: 5,
    },
    {
      id: "moana-rhythm",
      title: "Moana's Rhythm Island",
      description: "Play island drums!",
      icon: Brain,
      path: "/moana-rhythm",
      color: "bg-gradient-to-br from-teal-500 to-green-600",
      minAge: 6,
    },

    // Digital/App-Based
    {
      id: "kingdom-builder-game",
      title: "Kingdom Builder Game",
      description: "Build and earn points!",
      icon: Grid3x3,
      path: "/kingdom-builder",
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      minAge: 7,
    },
    {
      id: "disney-emoji",
      title: "Disney Emoji Quest",
      description: "Match-3 puzzle fun!",
      icon: Grid3x3,
      path: "/disney-emoji-quest",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600",
      minAge: 6,
    },
    {
      id: "frozen-maze",
      title: "Frozen Ice Maze",
      description: "Navigate the maze!",
      icon: Grid3x3,
      path: "/frozen-maze",
      color: "bg-gradient-to-br from-cyan-500 to-blue-600",
      minAge: 7,
    },
    {
      id: "pixie-flight",
      title: "Pixie Flight Simulator",
      description: "Fly and collect pollen!",
      icon: CircleDot,
      path: "/pixie-flight",
      color: "bg-gradient-to-br from-lime-400 to-green-500",
      minAge: 6,
    },

    // Cooperative/Educational
    {
      id: "storybook-builders",
      title: "Storybook Builders",
      description: "Create stories together!",
      icon: MessageCircle,
      path: "/storybook-builders",
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      minAge: 7,
    },
    {
      id: "kingdom-coding",
      title: "Kingdom Coding",
      description: "Learn to code!",
      icon: Grid3x3,
      path: "/kingdom-coding",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      minAge: 8,
    },
    {
      id: "disney-bake-off",
      title: "Disney Bake-Off",
      description: "Magical baking fun!",
      icon: Palette,
      path: "/disney-bake-off",
      color: "bg-gradient-to-br from-orange-500 to-red-600",
      minAge: 6,
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
              <Users className="mr-2 h-5 w-5" />
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
