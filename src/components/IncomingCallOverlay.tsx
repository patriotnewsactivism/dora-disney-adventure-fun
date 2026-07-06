import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";

interface IncomingCall {
  slug: string;
  child_name: string | null;
}

// Full-screen "someone is calling" overlay for the KID side of the app.
// Mounted once near the app root so it can pop up over any game/page while
// a profile is selected. Purely tap-to-answer — no typing needed.
const IncomingCallOverlay = () => {
  const { currentProfile } = useProfile();
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!currentProfile) return;

    const channel = supabase
      .channel(`incoming-calls-${currentProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "video_calls",
          filter: `profile_id=eq.${currentProfile.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row.initiated_by === "parent" && row.status === "ringing") {
            setIncoming({ slug: row.slug, child_name: row.child_name });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfile]);

  if (!incoming) return null;

  const decline = async () => {
    await supabase.from("video_calls").update({ status: "declined" }).eq("slug", incoming.slug);
    setIncoming(null);
  };

  const answer = () => {
    const slug = incoming.slug;
    setIncoming(null);
    navigate(`/call/${slug}?role=guest&name=${encodeURIComponent(currentProfile?.name || "")}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex flex-col items-center justify-center px-6 text-center animate-in fade-in">
      <div className="text-8xl mb-6 animate-bounce">📹</div>
      <h1 className="text-4xl font-extrabold text-white mb-3 drop-shadow">Video Call!</h1>
      <p className="text-white/90 text-xl mb-10">Mom or Dad wants to see you!</p>

      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-2">
          <Button
            size="icon"
            className="h-24 w-24 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-2xl animate-pulse"
            onClick={answer}
          >
            <Phone className="h-10 w-10 text-white" />
          </Button>
          <span className="text-white font-semibold text-lg">Answer</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button
            size="icon"
            className="h-24 w-24 rounded-full bg-destructive hover:bg-destructive/90 shadow-2xl"
            onClick={decline}
          >
            <PhoneOff className="h-10 w-10 text-white" />
          </Button>
          <span className="text-white font-semibold text-lg">Not now</span>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallOverlay;
