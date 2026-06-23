import React from 'react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Achievement } from '../data/achievements';

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Achievements">
      {achievements.map((achievement) => (
        <TooltipProvider key={achievement.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={achievement.unlocked ? 'default' : 'secondary'}
                className={`cursor-pointer text-sm px-3 py-1 ${achievement.unlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                aria-label={`${achievement.name}: ${achievement.description} - ${achievement.unlocked ? 'Unlocked' : 'Locked'}`}
              >
                {achievement.icon} {achievement.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{achievement.name}</p>
              <p>{achievement.description}</p>
              {!achievement.unlocked && achievement.target && achievement.currentProgress !== undefined && (
                <p className="text-sm text-gray-400">Progress: {achievement.currentProgress}/{achievement.target}</p>
              )}
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-xs text-gray-400">Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default Achievements;
