import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VideoCallSession, CallRole } from "@/utils/VideoCall";
import { useToast } from "@/hooks/use-toast";

type CallStatus = "connecting" | "waiting" | "ringing-remote" | "connected" | "ended" | "error" | "full";

const VideoCall = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const role = (searchParams.get("role") === "guest" ? "guest" : "host") as CallRole;
  const displayName = searchParams.get("name") || (role === "host" ? "You" : "Caller");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<VideoCallSession | null>(null);

  const [status, setStatus] = useState<CallStatus>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const endCall = useCallback(
    async (navigateHome = true) => {
      sessionRef.current?.end();
      sessionRef.current = null;
      if (slug) {
        await supabase
          .from("video_calls")
          .update({ status: "ended", ended_at: new Date().toISOString() })
          .eq("slug", slug);
      }
      setStatus("ended");
      if (navigateHome) {
        setTimeout(() => navigate("/"), 1500);
      }
    },
    [slug, navigate]
  );

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const session = new VideoCallSession(slug, role, {
      onLocalStream: (stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      },
      onRemoteStream: (stream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      },
      onPeerJoined: () => {
        if (cancelled) return;
        setStatus("connected");
        if (slug) {
          supabase
            .from("video_calls")
            .update({ status: "active", answered_at: new Date().toISOString() })
            .eq("slug", slug);
        }
      },
      onPeerLeft: () => {
        if (cancelled) return;
        toast({ title: "Call ended", description: "The other person left the call." });
        endCall();
      },
      onConnectionStateChange: (state) => {
        if (state === "failed" || state === "disconnected") {
          if (!cancelled) setStatus((s) => (s === "connected" ? "connected" : s));
        }
      },
      onRoomFull: () => {
        if (!cancelled) setStatus("full");
      },
      onError: (msg) => {
        if (!cancelled) {
          setErrorMsg(msg);
          setStatus("error");
        }
      },
    });

    sessionRef.current = session;
    setStatus("waiting");

    session.start().catch(() => {
      /* handled via onError */
    });

    return () => {
      cancelled = true;
      session.end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    sessionRef.current?.toggleMic(next);
  };

  const toggleCamera = () => {
    const next = !cameraOn;
    setCameraOn(next);
    sessionRef.current?.toggleCamera(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex flex-col">
      {/* Remote video fills the screen */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black/40"
        />

        {status !== "connected" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center mb-6 animate-pulse">
              <span className="text-6xl">✨</span>
            </div>
            {status === "connecting" || status === "waiting" ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {role === "host" ? `Calling...` : `Joining ${displayName}...`}
                </h1>
                <p className="text-white/70 text-lg">Hang tight, magic is loading! 🪄</p>
              </>
            ) : status === "full" ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">This call is already happening 📞</h1>
                <p className="text-white/70 text-lg">Someone is already on this call.</p>
              </>
            ) : status === "ended" ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Call ended 👋</h1>
                <p className="text-white/70 text-lg">See you next time!</p>
              </>
            ) : status === "error" ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Oops! 😅</h1>
                <p className="text-white/70 text-lg">{errorMsg}</p>
              </>
            ) : null}
          </div>
        )}

        {/* Local (self) video, small corner tile */}
        <div className="absolute bottom-24 right-4 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl bg-black/50">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-white/15 hover:bg-white/25 text-white h-12 w-12"
          onClick={() => navigate("/")}
        >
          <Home className="h-6 w-6" />
        </Button>
      </div>

      {/* Big, simple controls — no typing required anywhere on this screen */}
      <div className="py-6 px-6 flex items-center justify-center gap-6 bg-black/30">
        <Button
          size="icon"
          className={`h-16 w-16 rounded-full ${micOn ? "bg-white/20 hover:bg-white/30" : "bg-destructive hover:bg-destructive/90"}`}
          onClick={toggleMic}
        >
          {micOn ? <Mic className="h-7 w-7 text-white" /> : <MicOff className="h-7 w-7 text-white" />}
        </Button>

        <Button
          size="icon"
          className="h-20 w-20 rounded-full bg-destructive hover:bg-destructive/90"
          onClick={() => endCall()}
        >
          <PhoneOff className="h-9 w-9 text-white" />
        </Button>

        <Button
          size="icon"
          className={`h-16 w-16 rounded-full ${cameraOn ? "bg-white/20 hover:bg-white/30" : "bg-destructive hover:bg-destructive/90"}`}
          onClick={toggleCamera}
        >
          {cameraOn ? <Video className="h-7 w-7 text-white" /> : <VideoOff className="h-7 w-7 text-white" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
