import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "./contexts/ProfileContext";
import { GameProgressProvider } from "./contexts/GameProgressContext"; // Import the new provider
import ProfileSelect from "./pages/ProfileSelect";
import Home from "./pages/Home";
import Memory from "./pages/Memory";
import TicTacToe from "./pages/TicTacToe";
import Hangman from "./pages/Hangman";
import Checkers from "./pages/Checkers";
import ColorByNumber from "./pages/ColorByNumber";
import AIChat from "./pages/AIChat";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";

// New Games - Ethan (Age 3)
import MonsterTruckRacing from "./pages/MonsterTruckRacing";
import SpiderManWebSling from "./pages/SpiderManWebSling";
import BigWheelsStunt from "./pages/BigWheelsStunt";

// New Games - All Ages
import WhackAMole from "./pages/WhackAMole";
import BalloonPop from "./pages/BalloonPop";
import SimonSays from "./pages/SimonSays";
import PuzzleSlide from "./pages/PuzzleSlide";
import DrawingPad from "./pages/DrawingPad";
import MusicMaker from "./pages/MusicMaker";

// Educational Games
import CountingGame from "./pages/CountingGame";
import LetterTracing from "./pages/LetterTracing";
import ShapeSorter from "./pages/ShapeSorter";
import Storytime from "./pages/Storytime";

// Imagination & Role-Play Games
import PrincessAcademy from "./pages/PrincessAcademy";
import PixieHollow from "./pages/PixieHollow";
import FrozenIceQuest from "./pages/FrozenIceQuest";
import EncantoMystery from "./pages/EncantoMystery";
import ArielTreasure from "./pages/ArielTreasure";

// Creative & Craft Games
import BuildKingdom from "./pages/BuildKingdom";
import DressDesigner from "./pages/DressDesigner";
import ZootopiaDetective from "./pages/ZootopiaDetective";
import MagicCarpet from "./pages/MagicCarpet";
import WishStar from "./pages/WishStar";

// Musical & Performance Games
import SingAlong from "./pages/SingAlong";
import UnderSeaDance from "./pages/UnderSeaDance";
import MoanaRhythm from "./pages/MoanaRhythm";

// Digital/App-Based Games
import KingdomBuilder from "./pages/KingdomBuilder";
import DisneyEmojiQuest from "./pages/DisneyEmojiQuest";
import FrozenMaze from "./pages/FrozenMaze";
import PixieFlight from "./pages/PixieFlight";

// Cooperative/Educational Games
import StorybookBuilders from "./pages/StorybookBuilders";
import KingdomCoding from "./pages/KingdomCoding";
import DisneyBakeOff from "./pages/DisneyBakeOff";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProfileProvider>
          <GameProgressProvider> {/* Wrap routes with GameProgressProvider */}
            <Routes>
              <Route path="/" element={<ProfileSelect />} />
              <Route path="/home" element={<Home />} />

              {/* Original Games */}
              <Route path="/memory" element={<Memory />} />
              <Route path="/tictactoe" element={<TicTacToe />} />
              <Route path="/hangman" element={<Hangman />} />
              <Route path="/checkers" element={<Checkers />} />
              <Route path="/coloring" element={<ColorByNumber />} />
              <Route path="/aichat" element={<AIChat />} />
              <Route path="/parent-dashboard" element={<ParentDashboard />} />

              {/* Ethan's Games (Age 3) */}
              <Route path="/monster-truck-racing" element={<MonsterTruckRacing />} />
              <Route path="/spiderman-web-sling" element={<SpiderManWebSling />} />
              <Route path="/big-wheels-stunt" element={<BigWheelsStunt />} />

              {/* All Ages Games */}
              <Route path="/whack-a-mole" element={<WhackAMole />} />
              <Route path="/balloon-pop" element={<BalloonPop />} />
              <Route path="/simon-says" element={<SimonSays />} />
              <Route path="/puzzle-slide" element={<PuzzleSlide />} />
              <Route path="/drawing-pad" element={<DrawingPad />} />
              <Route path="/music-maker" element={<MusicMaker />} />

              {/* Educational Games */}
              <Route path="/counting-game" element={<CountingGame />} />
              <Route path="/letter-tracing" element={<LetterTracing />} />
              <Route path="/shape-sorter" element={<ShapeSorter />} />
              <Route path="/storytime" element={<Storytime />} />

              {/* Imagination & Role-Play */}
              <Route path="/princess-academy" element={<PrincessAcademy />} />
              <Route path="/pixie-hollow" element={<PixieHollow />} />
              <Route path="/frozen-ice-quest" element={<FrozenIceQuest />} />
              <Route path="/encanto-mystery" element={<EncantoMystery />} />
              <Route path="/ariel-treasure" element={<ArielTreasure />} />

              {/* Creative & Craft */}
              <Route path="/build-kingdom" element={<BuildKingdom />} />
              <Route path="/dress-designer" element={<DressDesigner />} />
              <Route path="/zootopia-detective" element={<ZootopiaDetective />} />
              <Route path="/magic-carpet" element={<MagicCarpet />} />
              <Route path="/wish-star" element={<WishStar />} />

              {/* Musical & Performance */}
              <Route path="/sing-along" element={<SingAlong />} />
              <Route path="/under-sea-dance" element={<UnderSeaDance />} />
              <Route path="/moana-rhythm" element={<MoanaRhythm />} />

              {/* Digital/App-Based */}
              <Route path="/kingdom-builder" element={<KingdomBuilder />} />
              <Route path="/disney-emoji-quest" element={<DisneyEmojiQuest />} />
              <Route path="/frozen-maze" element={<FrozenMaze />} />
              <Route path="/pixie-flight" element={<PixieFlight />} />

              {/* Cooperative/Educational */}
              <Route path="/storybook-builders" element={<StorybookBuilders />} />
              <Route path="/kingdom-coding" element={<KingdomCoding />} />
              <Route path="/disney-bake-off" element={<DisneyBakeOff />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GameProgressProvider>
        </ProfileProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
