import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Command {
  phrases: string[];
  callback: () => void;
  description: string;
}

interface VoiceCommandOptions {
  onCommandRecognized?: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

const useVoiceCommands = (options?: VoiceCommandOptions) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandsRef = useRef<Command[]>([]);

  const registerCommand = useCallback((command: Command) => {
    commandsRef.current.push(command);
  }, []);

  // Define core commands
  useEffect(() => {
    registerCommand({
      phrases: ['mickey memory', 'memory game', 'play memory'],
      callback: () => navigate('/memory'),
      description: 'Go to the Memory game'
    });
    registerCommand({
      phrases: ['go home', 'take me home', 'home page'],
      callback: () => navigate('/'),
      description: 'Go to the Home page'
    });
    // Example for 'Elsa help' - this would need to trigger a specific component's hint function
    // For now, it's a placeholder. The actual implementation would depend on how hints are exposed.
    registerCommand({
      phrases: ['elsa help', 'show hints', 'give me a hint'],
      callback: () => console.log('Voice command: Elsa help/show hints'), // Placeholder
      description: 'Show hints or provide help (game-specific)'
    });
    // Add more global commands here
  }, [navigate, registerCommand]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Web Speech API is not supported by this browser.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = false; // Only return final results
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      options?.onListeningChange?.(true);
      console.log('Voice recognition started.');
    };

    recognition.onend = () => {
      setIsListening(false);
      options?.onListeningChange?.(false);
      console.log('Voice recognition ended. Restarting...');
      // Automatically restart if it stops unexpectedly
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      options?.onListeningChange?.(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.error('Microphone access denied or blocked. Please enable it in your browser settings.');
      }
      // Attempt to restart after an error, but with a delay to prevent rapid restarts
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      }, 1000);
    };

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();
      console.log('Voice command detected:', transcript);
      options?.onCommandRecognized?.(transcript);

      let commandFound = false;
      for (const command of commandsRef.current) {
        for (const phrase of command.phrases) {
          if (transcript.includes(phrase)) {
            console.log(`Executing command for phrase: ${phrase}`);
            command.callback();
            commandFound = true;
            break;
          }
        }
        if (commandFound) break;
      }

      if (!commandFound) {
        console.log('No matching command found for:', transcript);
      }
    };

    recognitionRef.current = recognition;

    // Start listening when the hook mounts
    recognition.start();

    return () => {
      // Stop listening when the component unmounts
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [options]); // Only re-run if options change

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const getAvailableCommands = useCallback(() => {
    return commandsRef.current.map(cmd => ({ phrases: cmd.phrases, description: cmd.description }));
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    registerCommand,
    getAvailableCommands,
  };
};

export default useVoiceCommands;
