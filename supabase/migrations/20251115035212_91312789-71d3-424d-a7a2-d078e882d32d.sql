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