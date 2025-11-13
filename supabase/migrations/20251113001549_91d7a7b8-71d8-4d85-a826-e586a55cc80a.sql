-- Create learning progress table
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id),
  topic TEXT NOT NULL,
  discussed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  milestone_type TEXT,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public insert on learning_progress"
  ON public.learning_progress
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read on learning_progress"
  ON public.learning_progress
  FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_learning_progress_profile_id ON public.learning_progress(profile_id);
CREATE INDEX idx_learning_progress_discussed_at ON public.learning_progress(discussed_at DESC);