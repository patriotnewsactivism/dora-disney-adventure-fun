import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Home } from "lucide-react";

interface GameLayoutProps {
  children: ReactNode;
  title: string;
}

const GameLayout = ({ children, title }: GameLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">{title}</h1>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
};

export default GameLayout;
