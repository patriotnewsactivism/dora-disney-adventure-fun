import { useEffect, useRef, useCallback } from 'react';

interface AudioCues {
  playSuccess: () => void;
  playFailure: () => void;
  playCelebration: () => void;
  stopCelebration: () => void;
  speak: (text: string) => void;
}

// Global AudioContext to avoid creating multiple instances
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const createOscillator = (context: AudioContext, frequency: number, type: OscillatorType, duration: number, volume: number) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  gainNode.gain.setValueAtTime(volume, context.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + duration);
};

const createChime = (context: AudioContext) => {
  createOscillator(context, 1000, 'sine', 0.1, 0.5); // High pitch
  setTimeout(() => createOscillator(context, 1500, 'sine', 0.1, 0.5), 100); // Higher pitch
};

const createBuzzer = (context: AudioContext) => {
  createOscillator(context, 400, 'square', 0.15, 0.4); // Medium pitch
  setTimeout(() => createOscillator(context, 300, 'square', 0.15, 0.4), 150); // Lower pitch
};

export const useAudioCues = (): AudioCues => {
  const celebrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize AudioContext on user interaction
    const initAudioContext = () => {
      if (!audioContext || audioContext.state === 'suspended') {
        getAudioContext().resume().catch(e => console.error('Failed to resume AudioContext:', e));
      }
      window.removeEventListener('click', initAudioContext);
      window.removeEventListener('keydown', initAudioContext);
    };

    window.addEventListener('click', initAudioContext);
    window.addEventListener('keydown', initAudioContext);

    // Preload celebration music
    celebrationAudioRef.current = new Audio('/assets/audio/celebration.mp3'); // Assuming you have a celebration.mp3
    celebrationAudioRef.current.loop = true;
    celebrationAudioRef.current.volume = 0.3;

    return () => {
      window.removeEventListener('click', initAudioContext);
      window.removeEventListener('keydown', initAudioContext);
      if (celebrationAudioRef.current) {
        celebrationAudioRef.current.pause();
        celebrationAudioRef.current.currentTime = 0;
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(e => console.error('Failed to close AudioContext:', e));
        audioContext = null;
      }
    };
  }, []);

  const playSuccess = useCallback(() => {
    const context = getAudioContext();
    if (context) {
      createChime(context);
    }
  }, []);

  const playFailure = useCallback(() => {
    const context = getAudioContext();
    if (context) {
      createBuzzer(context);
    }
  }, []);

  const playCelebration = useCallback(() => {
    if (celebrationAudioRef.current) {
      celebrationAudioRef.current.play().catch(e => console.error('Failed to play celebration audio:', e));
    }
  }, []);

  const stopCelebration = useCallback(() => {
    if (celebrationAudioRef.current) {
      celebrationAudioRef.current.pause();
      celebrationAudioRef.current.currentTime = 0;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      if (synthRef.current) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      // Optionally, set a voice
      // const voices = window.speechSynthesis.getVoices();
      // utterance.voice = voices.find(voice => voice.lang === 'en-US') || null;
      window.speechSynthesis.speak(utterance);
      synthRef.current = utterance;
    } else {
      console.warn('SpeechSynthesis API not supported in this browser.');
    }
  }, []);

  return {
    playSuccess,
    playFailure,
    playCelebration,
    stopCelebration,
    speak,
  };
};

// Example of how to use speak for general announcements (can be integrated with useAnnouncer if needed)
export const announceWithSpeech = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('SpeechSynthesis API not supported.');
  }
};
