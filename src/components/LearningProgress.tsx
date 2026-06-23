import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Star, TrendingUp } from "lucide-react";

interface LearningEntry {
  id: string;
  topic: string;
  discussed_at: string;
  milestone_type?: string;
}

interface LearningProgressProps {
  profileId: string;
}

const LearningProgress = ({ profileId }: LearningProgressProps) => {
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [milestones, setMilestones] = useState<string[]>([]);

  useEffect(() => {
    loadProgress();
  }, [profileId]);

  const loadProgress = async () => {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('profile_id', profileId)
      .order('discussed_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading progress:', error);
      return;
    }

    setEntries(data || []);
    const uniqueMilestones = [...new Set(
      (data || [])
        .filter(e => e.milestone_type)
        .map(e => e.milestone_type!)
    )];
    setMilestones(uniqueMilestones);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">Learning Journey</h3>
        </div>

        {milestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-800 dark:text-purple-200">
              <Star className="w-4 h-4" />
              <span>Milestones</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {milestones.map((milestone, idx) => (
                <Badge key={idx} variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  ð {milestone}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-800 dark:text-purple-200">
            <TrendingUp className="w-4 h-4" />
            <span>Topics Explored</span>
          </div>
          <ScrollArea className="h-[200px] pr-4">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Start chatting to track your learning!</p>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{entry.topic}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.discussed_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};

export default LearningProgress;
