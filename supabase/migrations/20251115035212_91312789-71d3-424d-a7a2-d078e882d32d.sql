-- Create conversation_messages table to store all chat history
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  character TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  audio_transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Allow public read and insert (for now)
CREATE POLICY "Allow public read on conversation_messages"
  ON public.conversation_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on conversation_messages"
  ON public.conversation_messages
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_conversation_messages_profile_id ON public.conversation_messages(profile_id);
CREATE INDEX idx_conversation_messages_created_at ON public.conversation_messages(created_at DESC);

-- Update game_progress table to ensure profile_id is properly tracked
ALTER TABLE public.game_progress 
  ADD COLUMN IF NOT EXISTS played_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_game_progress_profile_id ON public.game_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_played_at ON public.game_progress(played_at DESC);

-- Add achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL, -- Unique identifier for the achievement (e.g., 'first_game_completed')
  progress INTEGER NOT NULL DEFAULT 0, -- Current progress towards the achievement
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (profile_id, achievement_id) -- Ensure a profile can only have one entry per achievement
);

-- Enable RLS for achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements table
CREATE POLICY "Allow read access to user achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Allow insert access for user achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Allow update access for user achievements" ON public.achievements
  FOR UPDATE USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Create index for faster queries on achievements
CREATE INDEX idx_achievements_profile_id ON public.achievements(profile_id);
CREATE INDEX idx_achievements_achievement_id ON public.achievements(achievement_id);
