import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
}

const ComingSoon = ({ title, description, features = [] }: ComingSoonProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 text-center border-4 border-primary shadow-2xl">
            <div className="text-8xl mb-6 animate-bounce">
              ð®
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary">
              {title}
            </h1>

            <p className="text-2xl text-muted-foreground mb-8">
              {description}
            </p>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-yellow-600" />
                <h2 className="text-3xl font-bold text-yellow-800">
                  Coming Soon!
                </h2>
                <Sparkles className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-xl text-yellow-900">
                This game is being built! Check back soon for an amazing new adventure!
              </p>
            </div>

            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">What to Expect:</h3>
                <ul className="text-left text-lg space-y-2 max-w-lg mx-auto">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-2xl">â¨</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link to="/home">
              <Button size="lg" className="text-2xl px-12 py-8">
                <Home className="mr-2 h-8 w-8" />
                Back to Games
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
