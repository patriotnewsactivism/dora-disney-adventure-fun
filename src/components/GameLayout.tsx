import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { Progress } from "./ui/progress";
import CharacterReactions from "./CharacterReactions";

interface GameLayoutProps {
  children: ReactNode;
  title: string;
  progress?: number;
  progressLabel?: string;
}

const GameLayout = ({ children, title, progress, progressLabel }: GameLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <CharacterReactions />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-primary" id="game-title">{title}</h1>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg" aria-label="Return to home page">
              <Home className="mr-2 h-5 w-5" aria-hidden="true" />
              Home
            </Button>
          </Link>
        </div>
        {progress !== undefined && (
          <div className="mb-6 space-y-2">
            <label htmlFor="game-progress" className="sr-only">{progressLabel || 'Game Progress'}</label>
            <Progress value={progress} className="h-3" id="game-progress" aria-label={progressLabel || 'Game Progress'} />
            {progressLabel && (
              <p className="text-sm text-muted-foreground" aria-hidden="true">
                {progressLabel}
              </p>
            )}
          </div>
        )}
        <div aria-live="polite" className="sr-only">
          {/* Announcements will be dynamically inserted here */}
        </div>
        {children}
      </div>
    </div>
  );
};

export default GameLayout;
