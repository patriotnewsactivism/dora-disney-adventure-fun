import React, { useState, useEffect } from 'react';
import MemoryGame from '../components/MemoryGame';
import CharacterPopup from '../components/CharacterPopup';
import Confetti from '../components/Confetti';
import { useProfile } from '../contexts/ProfileContext';
import AchievementPopup from '../components/AchievementPopup';
import { achievements } from '../data/achievements';
import { Achievement } from '../data/achievements';

const Memory: React.FC = () => {
  const [showCharacterPopup, setShowCharacterPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const { profile, addAchievement } = useProfile();

  const handleGameComplete = (matches: number) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds

    // Check for achievements
    const memoryMasterAchievement = achievements.find(ach => ach.id === 'memory_master');
    if (memoryMasterAchievement && matches >= 10 && !profile?.achievements?.includes(memoryMasterAchievement.id)) {
      addAchievement(memoryMasterAchievement.id);
      setUnlockedAchievement(memoryMasterAchievement);
      setShowAchievementPopup(true);
    }

    // You can add more achievement checks here based on game performance
  };

  const handleCloseAchievementPopup = () => {
    setShowAchievementPopup(false);
    setUnlockedAchievement(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-red-200 p-4 relative">
      <h1 className="text-5xl font-extrabold text-purple-800 mb-8 drop-shadow-lg">Memory Game</h1>
      <MemoryGame onGameComplete={handleGameComplete} />
      <button
        onClick={() => setShowCharacterPopup(true)}
        className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
      >
        Show Character Info
      </button>

      {showCharacterPopup && (
        <CharacterPopup
          characterName="Mickey Mouse"
          description="Mickey Mouse is a cartoon character created in 1928 by Walt Disney and Ub Iwerks. He is the official mascot of The Walt Disney Company."
          imageUrl="/assets/characters/mickey.png" // Replace with actual image path
          onClose={() => setShowCharacterPopup(false)}
        />
      )}

      {showConfetti && <Confetti />}

      {showAchievementPopup && unlockedAchievement && (
        <AchievementPopup
          achievement={unlockedAchievement}
          onClose={handleCloseAchievementPopup}
        />
      )}
    </div>
  );
};

export default Memory;
