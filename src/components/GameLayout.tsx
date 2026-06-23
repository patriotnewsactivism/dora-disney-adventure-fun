import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { Progress } from "./ui/progress"; // Import Progress component

interface GameLayoutProps {
  children: ReactNode;
  title: string;
  progress?: number; // Optional progress value (0-100)
  progressLabel?: string; // Optional label for the progress bar
}

const GameLayout = ({ children, title, progress, progressLabel }: GameLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">{title}</h1>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg min-w-[120px] h-[48px]"> {/* Ensure touch target for button */}
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </div>
        {progress !== undefined && (
          <div className="mb-6 w-full max-w-md mx-auto" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={progressLabel || `Game progress: ${progress}%`}>
            {progressLabel && <p className="text-center text-sm text-muted-foreground mb-1">{progressLabel}</p>}
            <Progress value={progress} className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full transition-all duration-500 ease-out" /> {/* Added transition for mobile-friendly animation */}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default GameLayout;
