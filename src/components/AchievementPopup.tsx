import React, { useEffect } from 'react';
import { useToast } from './ui/use-toast';
import { Achievement } from '../data/achievements';
import { CheckCircle } from 'lucide-react';

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (achievement.unlocked) {
      toast({
        title: (<span><CheckCircle className="inline-block mr-2 h-5 w-5 text-green-500" />Achievement Unlocked!</span>),
        description: (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{achievement.icon}</span>
            <div>
              <p className="font-bold">{achievement.name}</p>
              <p className="text-sm text-gray-500">{achievement.description}</p>
            </div>
          </div>
        ),
        duration: 5000,
        onOpenChange: (open) => {
          if (!open) {
            onClose();
          }
        },
      });
    } else {
      onClose(); // Close if achievement is not unlocked
    }
  }, [achievement, onClose, toast]);

  return null; // This component doesn't render anything directly, it just triggers a toast
};

export default AchievementPopup;
