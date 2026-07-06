import { supabase } from "@/integrations/supabase/client";
import { generateCallSlug } from "@/utils/VideoCall";

export async function createCallSession(params: {
  profileId: string | null;
  childName: string;
  initiatedBy: "child" | "parent";
}): Promise<string> {
  const slug = generateCallSlug();
  const { error } = await supabase.from("video_calls").insert({
    slug,
    profile_id: params.profileId,
    child_name: params.childName,
    initiated_by: params.initiatedBy,
    status: "ringing",
  });

  if (error) throw error;
  return slug;
}
