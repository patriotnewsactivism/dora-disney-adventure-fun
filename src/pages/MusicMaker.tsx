import { useState, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  instrument: string;
  note: string;
  time: number;
}

const MusicMaker = () => {
  const [recording, setRecording] = useState<Note[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const startTimeRef = useRef<number>(0);

  const instruments = [
    { id: "piano", name: "ð¹ Piano", color: "bg-blue-500", type: "sine" },
    { id: "drum", name: "ð¥ Drum", color: "bg-red-500", type: "sawtooth" },
    { id: "guitar", name: "ð¸ Guitar", color: "bg-green-500", type: "square" },
    { id: "bell", name: "ð Bell", color: "bg-yellow-500", type: "triangle" },
  ];

  const notes = [
    { note: "C", frequency: 261.63, label: "Do" },
    { note: "D", frequency: 293.66, label: "Re" },
    { note: "E", frequency: 329.63, label: "Mi" },
    { note: "F", frequency: 349.23, label: "Fa" },
    { note: "G", frequency: 392.00, label: "Sol" },
    { note: "A", frequency: 440.00, label: "La" },
    { note: "B", frequency: 493.88, label: "Ti" },
    { note: "C2", frequency: 523.25, label: "Do" },
  ];

  const playSound = (frequency: number, instrumentType: OscillatorType = "sine", duration: number = 0.5) => {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = instrumentType;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const handleNoteClick = (note: typeof notes[0], instrument: typeof instruments[0]) => {
    playSound(note.frequency, instrument.type as OscillatorType);

    // Record the note
    const now = Date.now();
    if (startTimeRef.current === 0) {
      startTimeRef.current = now;
    }

    const newNote: Note = {
      id: `${now}-${Math.random()}`,
      instrument: instrument.id,
      note: note.note,
      time: now - startTimeRef.current,
    };

    setRecording(prev => [...prev, newNote]);
  };

  const playRecording = async () => {
    if (recording.length === 0) return;

    setIsPlaying(true);
    setCurrentTime(0);

    const sortedNotes = [...recording].sort((a, b) => a.time - b.time);

    for (let i = 0; i < sortedNotes.length; i++) {
      const note = sortedNotes[i];
      const nextTime = sortedNotes[i + 1]?.time || note.time;
      const delay = i === 0 ? 0 : (note.time - sortedNotes[i - 1].time);

      await new Promise(resolve => setTimeout(resolve, delay));

      const noteData = notes.find(n => n.note === note.note);
      const instrumentData = instruments.find(inst => inst.id === note.instrument);

      if (noteData && instrumentData) {
        playSound(noteData.frequency, instrumentData.type as OscillatorType);
      }

      setCurrentTime(note.time);
    }

    setIsPlaying(false);
    setCurrentTime(0);
  };

  const clearRecording = () => {
    setRecording([]);
    setCurrentTime(0);
    startTimeRef.current = 0;
    setIsPlaying(false);
  };

  return (
    <GameLayout title="Music Maker! ðµ">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Create Your Own Music!
          </h2>
          <p className="text-xl text-muted-foreground">
            Tap the notes to play sounds and create a song!
          </p>
        </div>

        {/* Recording Info */}
        <div className="mb-6 flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <Music className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">
              Notes: <span className="text-primary">{recording.length}</span>
            </div>
          </div>
          {isPlaying && (
            <div className="text-2xl font-bold text-accent animate-pulse">
              âª Playing... âª
            </div>
          )}
        </div>

        {/* Instruments */}
        <div className="space-y-6 mb-8">
          {instruments.map(instrument => (
            <div key={instrument.id} className={cn(
              "p-6 rounded-3xl border-4 border-white shadow-xl",
              instrument.color
            )}>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {instrument.name}
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {notes.map(note => (
                  <button
                    key={`${instrument.id}-${note.note}`}
                    onClick={() => handleNoteClick(note, instrument)}
                    disabled={isPlaying}
                    className={cn(
                      "aspect-square rounded-2xl border-4 border-white bg-white/20 backdrop-blur-sm text-white font-bold text-xl transition-all duration-150",
                      "hover:scale-110 hover:bg-white/40 active:scale-95",
                      isPlaying && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <div className="text-lg">{note.label}</div>
                    <div className="text-xs opacity-75">{note.note}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Playback Controls */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-3xl border-4 border-white shadow-xl">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Button
              onClick={playRecording}
              disabled={recording.length === 0 || isPlaying}
              size="lg"
              className="text-xl px-8 py-6 bg-green-600 hover:bg-green-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-6 w-6" />
                  Playing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-6 w-6" />
                  Play Song
                </>
              )}
            </Button>

            <Button
              onClick={clearRecording}
              disabled={recording.length === 0 || isPlaying}
              size="lg"
              variant="destructive"
              className="text-xl px-8 py-6"
            >
              <RotateCcw className="mr-2 h-6 w-6" />
              Clear
            </Button>

            <div className="text-white text-xl font-bold">
              {recording.length === 0
                ? "Start playing notes!"
                : `${recording.length} notes recorded`}
            </div>
          </div>

          {/* Visual Recording Timeline */}
          {recording.length > 0 && (
            <div className="mt-6 bg-white/20 rounded-2xl p-4">
              <div className="flex flex-wrap gap-2">
                {recording.slice(-20).map((note, i) => {
                  const instrument = instruments.find(inst => inst.id === note.instrument);
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        "px-3 py-1 rounded-lg text-white font-semibold text-sm",
                        instrument?.color || "bg-gray-500"
                      )}
                    >
                      {note.note}
                    </div>
                  );
                })}
                {recording.length > 20 && (
                  <div className="px-3 py-1 text-white opacity-75">
                    +{recording.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-lg text-muted-foreground">
            Try creating a melody with different instruments!
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default MusicMaker;
