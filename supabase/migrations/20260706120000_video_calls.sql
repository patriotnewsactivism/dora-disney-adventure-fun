-- Video calling: lightweight call session tracker.
-- Actual audio/video never touches this table or Supabase at all — it flows
-- peer-to-peer directly between browsers via WebRTC (DTLS-SRTP encrypted).
-- This table only coordinates "who is calling whom" and expires quickly.

CREATE TABLE IF NOT EXISTS public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_name TEXT,
  initiated_by TEXT NOT NULL CHECK (initiated_by IN ('child', 'parent')),
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'missed', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '20 minutes')
);

ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- Anyone with the app's public key can start a call (no login system in this app)
CREATE POLICY "Allow insert on video_calls"
  ON public.video_calls FOR INSERT
  WITH CHECK (true);

-- Only expose calls that haven't expired yet (limits the exposure window)
CREATE POLICY "Allow read of non-expired calls"
  ON public.video_calls FOR SELECT
  USING (expires_at > now());

-- Allow updating status (answered/ended) on non-expired calls
CREATE POLICY "Allow update of non-expired calls"
  ON public.video_calls FOR UPDATE
  USING (expires_at > now());

CREATE INDEX IF NOT EXISTS idx_video_calls_profile_id ON public.video_calls(profile_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON public.video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_created_at ON public.video_calls(created_at DESC);

-- Turn on realtime so the kid's screen and the Parent Dashboard get instant
-- "incoming call" / "call answered" / "call ended" updates without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;
