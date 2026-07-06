import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GATE_ICONS, DEFAULT_GATE_CODE } from "@/data/gateIcons";

const STORAGE_KEY = "familyGateUnlockedUntil";
const UNLOCK_DAYS = 90;

function isUnlockedOnThisDevice(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const until = parseInt(raw, 10);
  return !Number.isNaN(until) && Date.now() < until;
}

function rememberUnlock() {
  const until = Date.now() + UNLOCK_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, String(until));
}

async function fetchGateCode(): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from("app_config")
      .select("family_code")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data?.family_code && Array.isArray(data.family_code) && data.family_code.length > 0) {
      return data.family_code as number[];
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_GATE_CODE as unknown as number[];
}

const FamilyGate = ({ children }: { children: ReactNode }) => {
  const [unlocked, setUnlocked] = useState(isUnlockedOnThisDevice());
  const [code, setCode] = useState<number[]>(DEFAULT_GATE_CODE as unknown as number[]);
  const [taps, setTaps] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);
  const [fails, setFails] = useState(0);

  useEffect(() => {
    if (!unlocked) {
      fetchGateCode().then(setCode);
    }
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const handleTap = (index: number) => {
    if (lockedOut) return;
    const next = [...taps, index];

    if (next[next.length - 1] !== code[next.length - 1]) {
      // wrong tap
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTaps([]);
      const newFails = fails + 1;
      setFails(newFails);
      if (newFails >= 5) {
        setLockedOut(true);
        setTimeout(() => {
          setLockedOut(false);
          setFails(0);
        }, 20000);
      }
      return;
    }

    if (next.length === code.length) {
      rememberUnlock();
      setUnlocked(true);
      return;
    }

    setTaps(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 flex flex-col items-center justify-center px-6 py-10">
      <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 text-center">
        ✨ Magic Password ✨
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 text-center">
        {lockedOut
          ? "Whoops, too many tries! Let's wait a moment..."
          : "Tap your special pictures in order!"}
      </p>

      <div className={`flex gap-2 mb-8 ${shake ? "animate-shake" : ""}`}>
        {code.map((_, i) => (
          <div
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-primary ${
              i < taps.length ? "bg-primary" : "bg-transparent"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3 md:gap-5 max-w-xl">
        {GATE_ICONS.map((icon, i) => (
          <button
            key={icon.id}
            disabled={lockedOut}
            onClick={() => handleTap(i)}
            className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-card border-2 border-border flex items-center justify-center text-3xl md:text-4xl shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
          >
            {icon.emoji}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-8 text-center max-w-sm">
        Grown-ups: ask your parent if you forget your magic password!
      </p>
    </div>
  );
};

export default FamilyGate;
