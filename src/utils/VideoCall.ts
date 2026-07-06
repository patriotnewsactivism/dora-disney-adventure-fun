import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Free public STUN + TURN servers. STUN alone fails on many home/cellular
// networks with strict NAT, so a TURN relay fallback is included for
// reliability. These are widely-used public demo credentials (Open Relay
// Project) — fine for a family app; swap in your own TURN creds later if
// you want guaranteed uptime.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

export type CallRole = "host" | "guest";

export interface VideoCallEvents {
  onLocalStream: (stream: MediaStream) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onPeerJoined: () => void;
  onPeerLeft: () => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onRoomFull: () => void;
  onError: (message: string) => void;
}

// One WebRTC peer connection + one Supabase Realtime broadcast channel used
// purely to exchange SDP offers/answers and ICE candidates. Once connected,
// video/audio flow directly between the two browsers — nothing touches
// Supabase or any server after that handshake.
export class VideoCallSession {
  private pc: RTCPeerConnection | null = null;
  private channel: RealtimeChannel | null = null;
  private localStream: MediaStream | null = null;
  private slug: string;
  private role: CallRole;
  private events: VideoCallEvents;
  private myId: string;
  private peerPresent = false;
  private makingOffer = false;

  constructor(slug: string, role: CallRole, events: VideoCallEvents) {
    this.slug = slug;
    this.role = role;
    this.events = events;
    this.myId = Math.random().toString(36).slice(2);
  }

  async start() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (err) {
      this.events.onError(
        "Couldn't access the camera or microphone. Please allow camera/mic access and try again."
      );
      throw err;
    }

    this.events.onLocalStream(this.localStream);

    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    this.localStream.getTracks().forEach((track) => {
      this.pc?.addTrack(track, this.localStream!);
    });

    this.pc.ontrack = (event) => {
      this.events.onRemoteStream(event.streams[0]);
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.send("ice-candidate", { candidate: event.candidate });
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.pc) this.events.onConnectionStateChange(this.pc.connectionState);
    };

    this.channel = supabase.channel(`call-${this.slug}`, {
      config: { broadcast: { self: false }, presence: { key: this.myId } },
    });

    this.channel
      .on("broadcast", { event: "signal" }, ({ payload }) => this.handleSignal(payload))
      .on("presence", { event: "sync" }, () => this.handlePresenceSync())
      .on("presence", { event: "leave" }, () => {
        this.peerPresent = false;
        this.events.onPeerLeft();
      });

    await new Promise<void>((resolve) => {
      this.channel!.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await this.channel!.track({ joined_at: Date.now() });
          resolve();
        }
      });
    });
  }

  private handlePresenceSync() {
    if (!this.channel) return;
    const state = this.channel.presenceState();
    const others = Object.keys(state).filter((k) => k !== this.myId);

    if (others.length > 1) {
      // Someone else already has this room open with another peer.
      this.events.onRoomFull();
      return;
    }

    if (others.length >= 1 && !this.peerPresent) {
      this.peerPresent = true;
      this.events.onPeerJoined();
      // Only the "host" initiates the offer, to avoid glare from both sides
      // sending offers simultaneously.
      if (this.role === "host") {
        this.makeOffer();
      }
    }
  }

  private async makeOffer() {
    if (!this.pc || this.makingOffer) return;
    try {
      this.makingOffer = true;
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.send("offer", { sdp: this.pc.localDescription });
    } finally {
      this.makingOffer = false;
    }
  }

  private async handleSignal(payload: any) {
    if (!this.pc) return;
    const { kind, data } = payload;

    if (kind === "offer") {
      await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.send("answer", { sdp: this.pc.localDescription });
    } else if (kind === "answer") {
      await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    } else if (kind === "ice-candidate") {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    }
  }

  private send(kind: string, data: any) {
    this.channel?.send({
      type: "broadcast",
      event: "signal",
      payload: { kind, data },
    });
  }

  toggleMic(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = enabled));
  }

  toggleCamera(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((t) => (t.enabled = enabled));
  }

  end() {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.pc?.close();
    this.pc = null;
    if (this.channel) {
      this.channel.untrack();
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

export function generateCallSlug(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
