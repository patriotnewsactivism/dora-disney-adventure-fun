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

// Returns the saved code as-is (including an empty array, which means
// "no password set yet — let the kids pick one"). Only falls back to the
// hardcoded default if we couldn't even reach the row (e.g. offline).
async function fetchGateCode(): Promise<number[] | null> {
  try {
    const { data, error } = await supabase
      .from("app_config")
      .select("family_code")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data && Array.isArray(data.family_code)) {
      return data.family_code as number[];
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_GATE_CODE as unknown as number[];
}

const MIN_CODE_LEN = 2;
const MAX_CODE_LEN = 4;

const FamilyGate = ({ children }: { children: ReactNode }) => {
  const [unlocked, setUnlocked] = useState(isUnlockedOnThisDevice());
  const [code, setCode] = useState<number[] | null>(null); // null = still loading
  const [taps, setTaps] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);
  const [fails, setFails] = useState(0);

  // Setup-flow state (kid is choosing a brand new password)
  const [setupDraft, setSetupDraft] = useState<number[]>([]);
  const [setupConfirm, setSetupConfirm] = useState<number[] | null>(null); // set once they hit "Done" the first time
  const [setupError, setSetupError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!unlocked) {
      fetchGateCode().then(setCode);
    }
  }, [unlocked]);

  if (unlocked) return <>{children}</>;
  if (code === null) return null; // brief loading flash, avoids UI jump

  const needsSetup = code.length === 0;

  // ---- Existing password entry flow ----
  const handleTap = (index: number) => {
    if (lockedOut) return;
    const next = [...taps, index];

    if (next[next.length - 1] !== code[next.length - 1]) {
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

  // ---- New password setup flow (first time, or after a reset) ----
  const handleSetupTap = (index: number) => {
    if (setupConfirm === null) {
      // Still building the first entry
      const next = [...setupDraft, index];
      setSetupDraft(next);
      return;
    }
    // Confirming: must match setupConfirm exactly, tap by tap
    const next = [...setupDraft, index];
    const pos = next.length - 1;
    if (setupConfirm[pos] !== index) {
      setSetupError(true);
      setTimeout(() => setSetupError(false), 500);
      setSetupDraft([]);
      return;
    }
    if (next.length === setupConfirm.length) {
      saveNewCode(setupConfirm);
      return;
    }
    setSetupDraft(next);
  };

  const confirmFirstEntry = () => {
    if (setupDraft.length < MIN_CODE_LEN) return;
    setSetupConfirm(setupDraft);
    setSetupDraft([]);
  };

  const startOver = () => {
    setSetupDraft([]);
    setSetupConfirm(null);
    setSetupError(false);
  };

  const saveNewCode = async (finalCode: number[]) => {
    setSaving(true);
    const { error } = await supabase
      .from("app_config")
      .update({ family_code: finalCode, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      setSetupError(true);
      startOver();
      return;
    }
    setCode(finalCode);
    rememberUnlock();
    setUnlocked(true);
  };

  if (needsSetup) {
    const draft = setupConfirm === null ? setupDraft : setupDraft;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 flex flex-col items-center justify-center px-6 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 text-center">
          ✨ Pick Your Magic Password! ✨
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-2 text-center max-w-md">
          {setupConfirm === null
            ? "Tap 2 to 4 pictures in an order you'll remember!"
            : setupError
            ? "Oops, that didn't match — let's try again!"
            : "Now tap the same pictures again to lock it in!"}
        </p>

        <div className={`flex gap-2 mb-6 ${setupError ? "animate-shake" : ""}`}>
          {draft.map((i, idx) => (
            <div key={idx} className="h-12 w-12 rounded-xl bg-card border-2 border-primary flex items-center justify-center text-2xl">
              {GATE_ICONS[i]?.emoji}
            </div>
          ))}
          {draft.length === 0 && (
            <div className="h-12 flex items-center text-sm text-muted-foreground">
              Tap pictures below to start...
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3 md:gap-5 max-w-xl mb-6">
          {GATE_ICONS.map((icon, i) => (
            <button
              key={icon.id}
              disabled={saving}
              onClick={() => handleSetupTap(i)}
              className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-card border-2 border-border flex items-center justify-center text-3xl md:text-4xl shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
            >
              {icon.emoji}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {setupConfirm === null && (
            <button
              onClick={confirmFirstEntry}
              disabled={setupDraft.length < MIN_CODE_LEN || setupDraft.length > MAX_CODE_LEN}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40"
            >
              That's my password!
            </button>
          )}
          {(setupDraft.length > 0 || setupConfirm !== null) && (
            <button
              onClick={startOver}
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-card border font-semibold text-muted-foreground"
            >
              Start Over
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-8 text-center max-w-sm">
          Grown-ups: this only shows up right after a password reset.
        </p>
      </div>
    );
  }

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
