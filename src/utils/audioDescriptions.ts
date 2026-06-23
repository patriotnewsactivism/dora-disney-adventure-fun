/**
 * src/utils/audioDescriptions.ts
 * 
 * This file provides a comprehensive audio system for accessibility features,
 * including Web Audio API implementations for audio cues and game state descriptions.
 * It aims to enhance the user experience for visually impaired users by providing
 * auditory feedback for game events and state changes.
 */

interface AudioContextState {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  speechSynthesisUtterance: SpeechSynthesisUtterance | null;
  speechSynthesis: SpeechSynthesis | null;
}

const audioState: AudioContextState = {
  audioContext: null,
  gainNode: null,
  speechSynthesisUtterance: null,
  speechSynthesis: null,
};

/**
 * Initializes the Web Audio API context and gain node.
 * This should be called on a user gesture (e.g., first click/touch) to bypass browser autoplay policies.
 */
export const initializeAudioContext = () => {
  if (!audioState.audioContext) {
    try {
      audioState.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioState.gainNode = audioState.audioContext.createGain();
      audioState.gainNode.connect(audioState.audioContext.destination);
      console.log('AudioContext initialized successfully.');
    } catch (error) {
      console.error('Error initializing AudioContext:', error);
    }
  }
  if (!audioState.speechSynthesis) {
    audioState.speechSynthesis = window.speechSynthesis;
    audioState.speechSynthesisUtterance = new SpeechSynthesisUtterance();
    audioState.speechSynthesisUtterance.lang = 'en-US';
    audioState.speechSynthesisUtterance.volume = 1; // 0 to 1
    audioState.speechSynthesisUtterance.rate = 1; // 0.1 to 10
    audioState.speechSynthesisUtterance.pitch = 1; // 0 to 2
    console.log('SpeechSynthesis initialized successfully.');
  }
};

/**
 * Plays a simple tone using the Web Audio API.
 * @param frequency The frequency of the tone in Hz.
 * @param duration The duration of the tone in milliseconds.
 * @param type The waveform type ('sine', 'square', 'sawtooth', 'triangle').
 * @param volume The volume of the tone (0 to 1).
 */
export const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.5) => {
  if (!audioState.audioContext || audioState.audioContext.state === 'suspended') {
    console.warn('AudioContext not initialized or suspended. Cannot play tone.');
    return;
  }

  const oscillator = audioState.audioContext.createOscillator();
  const gainNode = audioState.audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioState.gainNode!); // Connect to the main gain node

  oscillator.frequency.setValueAtTime(frequency, audioState.audioContext.currentTime);
  oscillator.type = type;
  gainNode.gain.setValueAtTime(volume, audioState.audioContext.currentTime);

  oscillator.start();
  oscillator.stop(audioState.audioContext.currentTime + duration / 1000);
};

/**
 * Plays an audio cue for a successful event.
 */
export const playSuccessCue = () => {
  console.log('Playing success cue...');
  playTone(880, 100, 'sine', 0.6); // High pitch, short tone
  setTimeout(() => playTone(1320, 150, 'sine', 0.6), 100); // Higher pitch, slightly longer
};

/**
 * Plays an audio cue for a failure or incorrect event.
 */
export const playFailureCue = () => {
  console.log('Playing failure cue...');
  playTone(220, 200, 'triangle', 0.7); // Low pitch, medium tone
  setTimeout(() => playTone(110, 250, 'triangle', 0.7), 200); // Lower pitch, longer
};

/**
 * Plays a celebration music-like sequence.
 */
export const playCelebrationMusic = () => {
  console.log('Playing celebration music...');
  if (!audioState.audioContext || audioState.audioContext.state === 'suspended') {
    console.warn('AudioContext not initialized or suspended. Cannot play celebration music.');
    return;
  }

  const context = audioState.audioContext;
  const baseTime = context.currentTime;
  const notes = [
    { freq: 523.25, duration: 0.15 }, // C5
    { freq: 659.25, duration: 0.15 }, // E5
    { freq: 783.99, duration: 0.2 },  // G5
    { freq: 1046.50, duration: 0.3 }, // C6
  ];

  let startTime = baseTime;
  notes.forEach((note, index) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioState.gainNode!); // Connect to the main gain node

    oscillator.frequency.setValueAtTime(note.freq, startTime);
    oscillator.type = 'triangle';

    // Attack-Decay envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.7, startTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + note.duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + note.duration);

    startTime += note.duration * 0.8; // Overlap notes slightly for a smoother sound
  });
};

/**
 * Announces a text description using the Web Speech API (screen reader announcement).
 * @param text The text to be announced.
 * @param interrupt If true, stop any ongoing speech before announcing new text.
 */
export const announce = (text: string, interrupt: boolean = true) => {
  if (!audioState.speechSynthesis || !audioState.speechSynthesisUtterance) {
    console.warn('SpeechSynthesis not initialized. Cannot announce text.');
    return;
  }

  if (interrupt && audioState.speechSynthesis.speaking) {
    audioState.speechSynthesis.cancel();
  }

  audioState.speechSynthesisUtterance.text = text;
  audioState.speechSynthesis.speak(audioState.speechSynthesisUtterance);
  console.log(`Announcing: "${text}"`);
};

/**
 * Sets the global volume for all Web Audio API cues.
 * @param volume A value between 0 (mute) and 1 (full volume).
 */
export const setGlobalAudioVolume = (volume: number) => {
  if (audioState.gainNode) {
    audioState.gainNode.gain.setValueAtTime(volume, audioState.audioContext!.currentTime);
    console.log(`Global audio volume set to: ${volume}`);
  } else {
    console.warn('GainNode not initialized. Cannot set global volume.');
  }
};

/**
 * Sets the speech rate for announcements.
 * @param rate A value between 0.1 (slowest) and 10 (fastest). Default is 1.
 */
export const setSpeechRate = (rate: number) => {
  if (audioState.speechSynthesisUtterance) {
    audioState.speechSynthesisUtterance.rate = Math.max(0.1, Math.min(10, rate));
    console.log(`Speech rate set to: ${rate}`);
  } else {
    console.warn('SpeechSynthesisUtterance not initialized. Cannot set speech rate.');
  }
};

/**
 * Sets the speech pitch for announcements.
 * @param pitch A value between 0 (lowest) and 2 (highest). Default is 1.
 */
export const setSpeechPitch = (pitch: number) => {
  if (audioState.speechSynthesisUtterance) {
    audioState.speechSynthesisUtterance.pitch = Math.max(0, Math.min(2, pitch));
    console.log(`Speech pitch set to: ${pitch}`);
  } else {
    console.warn('SpeechSynthesisUtterance not initialized. Cannot set speech pitch.');
  n}
};

/**
 * Example usage for game state descriptions.
 * @param cardsFlipped Number of cards currently flipped.
 * @param matchesFound Number of matches found so far.
 */
export const describeMemoryGameState = (cardsFlipped: number, matchesFound: number) => {
  const description = `${cardsFlipped} cards flipped, ${matchesFound} matches found.`;
  announce(description);
};

// Add more specific audio descriptions and cues as needed for other games/events

/**
 * Announces score changes.
 * @param newScore The new score.
 * @param gameName Optional: The name of the game for context.
 */
export const announceScoreChange = (newScore: number, gameName?: string) => {
  const text = gameName ? `In ${gameName}, your score is now ${newScore}.` : `Your score is now ${newScore}.`;
  announce(text);
};

/**
 * Announces level completion.
 * @param level The completed level number.
 * @param gameName Optional: The name of the game for context.
 */
export const announceLevelCompletion = (level: number, gameName?: string) => {
  const text = gameName ? `Congratulations! You completed level ${level} in ${gameName}.` : `Congratulations! You completed level ${level}.`;
  announce(text, true);
  playCelebrationMusic();
};

/**
 * Announces character dialogue.
 * @param characterName The name of the character speaking.
 * @param dialogue The dialogue text.
 */
export const announceCharacterDialogue = (characterName: string, dialogue: string) => {
  const text = `${characterName} says: ${dialogue}`;
  announce(text, true);
};
