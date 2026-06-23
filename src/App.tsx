import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileProvider } from "./contexts/ProfileContext";
import { GameProgressProvider } from "./contexts/GameProgressContext";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ParentDashboard from "./pages/ParentDashboard";
import ProfileSelect from "./pages/ProfileSelect";
import AIChat from "./pages/AIChat";
import Memory from "./pages/Memory";
import TicTacToe from "./pages/TicTacToe";
import WhackAMole from "./pages/WhackAMole";
import CountingGame from "./pages/CountingGame";
import LetterTracing from "./pages/LetterTracing";
import ShapeSorter from "./pages/ShapeSorter";
import ColorByNumber from "./pages/ColorByNumber";
import DrawingPad from "./pages/DrawingPad";
import MusicMaker from "./pages/MusicMaker";
import Storytime from "./pages/Storytime";
import SingAlong from "./pages/SingAlong";
import PrincessAcademy from "./pages/PrincessAcademy";
import FrozenIceQuest from "./pages/FrozenIceQuest";
import MoanaRhythm from "./pages/MoanaRhythm";
import ArielTreasure from "./pages/ArielTreasure";
import DisneyEmojiQuest from "./pages/DisneyEmojiQuest";
import EncantoMystery from "./pages/EncantoMystery";
import DisneyBakeOff from "./pages/DisneyBakeOff";
import FrozenMaze from "./pages/FrozenMaze";
import PixieFlight from "./pages/PixieFlight";
import PixieHollow from "./pages/PixieHollow";
import WishStar from "./pages/WishStar";
import ZootopiaDetective from "./pages/ZootopiaDetective";
import UnderSeaDance from "./pages/UnderSeaDance";
import Hangman from "./pages/Hangman";
import PuzzleSlide from "./pages/PuzzleSlide";
import SimonSays from "./pages/SimonSays";
import MonsterTruckRacing from "./pages/MonsterTruckRacing";
import BigWheelsStunt from "./pages/BigWheelsStunt";
import KingdomBuilder from "./pages/KingdomBuilder";
import BuildKingdom from "./pages/BuildKingdom";
import KingdomCoding from "./pages/KingdomCoding";
import StorybookBuilders from "./pages/StorybookBuilders";
import DressDesigner from "./pages/DressDesigner";
import MagicCarpet from "./pages/MagicCarpet";
import BalloonPop from "./pages/BalloonPop";
import SpiderManWebSling from "./pages/SpiderManWebSling";
import ComingSoon from "./pages/ComingSoon";
import AchievementGallery from "./pages/AchievementGallery";
import RewardShop from "./pages/RewardShop"; // Import the new RewardShop

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProfileProvider>
          <GameProgressProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile-select" element={<ProfileSelect />} />
                <Route path="/parent-dashboard" element={<ParentDashboard />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/memory" element={<Memory />} />
                <Route path="/tic-tac-toe" element={<TicTacToe />} />
                <Route path="/whack-a-mole" element={<WhackAMole />} />
                <Route path="/counting-game" element={<CountingGame />} />
                <Route path="/letter-tracing" element={<LetterTracing />} />
                <Route path="/shape-sorter" element={<ShapeSorter />} />
                <Route path="/color-by-number" element={<ColorByNumber />} />
                <Route path="/drawing-pad" element={<DrawingPad />} />
                <Route path="/music-maker" element={<MusicMaker />} />
                <Route path="/storybook-builders" element={<StorybookBuilders />} />
                <Route path="/storytime" element={<Storytime />} />
                <Route path="/sing-along" element={<SingAlong />} />
                <Route path="/princess-academy" element={<PrincessAcademy />} />
                <Route path="/frozen-ice-quest" element={<FrozenIceQuest />} />
                <Route path="/moana-rhythm" element={<MoanaRhythm />} />
                <Route path="/ariel-treasure" element={<ArielTreasure />} />
                <Route path="/disney-emoji-quest" element={<DisneyEmojiQuest />} />
                <Route path="/encanto-mystery" element={<EncantoMystery />} />
                <Route path="/disney-bake-off" element={<DisneyBakeOff />} />
                <Route path="/frozen-maze" element={<FrozenMaze />} />
                <Route path="/pixie-flight" element={<PixieFlight />} />
                <Route path="/pixie-hollow" element={<PixieHollow />} />
                <Route path="/wish-star" element={<WishStar />} />
                <Route path="/zootopia-detective" element={<ZootopiaDetective />} />
                <Route path="/under-sea-dance" element={<UnderSeaDance />} />
                <Route path="/hangman" element={<Hangman />} />
                <Route path="/puzzle-slide" element={<PuzzleSlide />} />
                <Route path="/simon-says" element={<SimonSays />} />
                <Route path="/monster-truck-racing" element={<MonsterTruckRacing />} />
                <Route path="/big-wheels-stunt" element={<BigWheelsStunt />} />
                <Route path="/kingdom-builder" element={<KingdomBuilder />} />
                <Route path="/build-kingdom" element={<BuildKingdom />} />
                <Route path="/kingdom-coding" element={<KingdomCoding />} />
                <Route path="/dress-designer" element={<DressDesigner />} />
                <Route path="/magic-carpet" element={<MagicCarpet />} />
                <Route path="/balloon-pop" element={<BalloonPop />} />
                <Route path="/spider-man-web-sling" element={<SpiderManWebSling />} />
                <Route path="/coming-soon" element={<ComingSoon />} />
                <Route path="/achievements" element={<AchievementGallery />} />
                <Route path="/reward-shop" element={<RewardShop />} /> {/* Add RewardShop route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </GameProgressProvider>
        </ProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
