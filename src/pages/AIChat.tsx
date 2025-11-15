import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Send, Volume2, Home, Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeVoiceChat } from "@/utils/RealtimeVoice";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import LearningProgress from "@/components/LearningProgress";
import minnieImg from "@/assets/minnie.png";
import mickeyImg from "@/assets/mickey.png";
import elsaImg from "@/assets/elsa.png";
import moanaImg from "@/assets/moana.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Character = "minnie" | "mickey" | "elsa" | "moana";

const characterConfig = {
  minnie: { 
    name: "Minnie Mouse", 
    img: minnieImg, 
    greeting: "Oh boy! Hi there! I'm Minnie Mouse! How wonderful to meet you! What would you like to talk about today? 🎀✨",
    color: "pink"
  },
  mickey: { 
    name: "Mickey Mouse", 
    img: mickeyImg, 
    greeting: "Hot dog! Hey there pal! I'm Mickey Mouse! Gosh, it's great to meet you! What adventure should we go on today? 🎩✨",
    color: "red"
  },
  elsa: { 
    name: "Elsa", 
    img: elsaImg, 
    greeting: "Hello! I'm Elsa from Arendelle! It's wonderful to meet you! Let's discover something magical together today! ❄️✨",
    color: "blue"
  },
  moana: { 
    name: "Moana", 
    img: moanaImg, 
    greeting: "Aloha! I'm Moana! The ocean called me, and I'm so happy to meet you! Ready for an adventure? 🌊✨",
    color: "teal"
  }
};

const AIChat = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>("minnie");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: characterConfig.minnie.greeting }
  ]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastTopic, setLastTopic] = useState<string>("");
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { currentProfile } = useProfile();
  
  const character = characterConfig[selectedCharacter];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  const extractTopic = (text: string): string => {
    const topics = [
      'counting', 'numbers', 'math', 'addition', 'subtraction',
      'letters', 'alphabet', 'reading', 'writing', 'spelling',
      'colors', 'shapes', 'animals', 'nature', 'plants', 'weather',
      'ocean', 'space', 'planets', 'stars', 'science',
      'friendship', 'feelings', 'emotions', 'kindness', 'sharing',
      'music', 'art', 'drawing', 'painting', 'creativity',
      'adventure', 'exploring', 'discovery', 'courage', 'bravery'
    ];
    
    const lowerText = text.toLowerCase();
    for (const topic of topics) {
      if (lowerText.includes(topic)) {
        return topic;
      }
    }
    return 'general conversation';
  };

  const [currentAssistantMessage, setCurrentAssistantMessage] = useState("");

  const saveMessage = async (role: 'user' | 'assistant', content: string, audioTranscript?: string) => {
    if (!currentProfile) return;
    
    try {
      await supabase.from('conversation_messages').insert({
        profile_id: currentProfile.id,
        character: selectedCharacter,
        role,
        content,
        audio_transcript: audioTranscript
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const saveProgress = async (topic: string, milestone?: string) => {
    if (!currentProfile) return;
    
    try {
      await supabase.from('learning_progress').insert({
        profile_id: currentProfile.id,
        topic,
        milestone_type: milestone
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleMessage = (event: any) => {
    console.log('Received event:', event.type);
    
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    } else if (event.type === 'input_audio_buffer.speech_started') {
      setIsListening(true);
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      setIsListening(false);
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const transcript = event.transcript;
      if (transcript) {
        setMessages(prev => [...prev, { role: "user", content: transcript }]);
        
        // Save user message
        saveMessage('user', transcript, transcript);
        
        const topic = extractTopic(transcript);
        if (topic !== lastTopic) {
          setLastTopic(topic);
          saveProgress(topic);
        }
      }
    } else if (event.type === 'response.audio_transcript.delta') {
      setCurrentAssistantMessage(prev => prev + event.delta);
    } else if (event.type === 'response.audio_transcript.done') {
      if (currentAssistantMessage) {
        const assistantMsg = currentAssistantMessage;
        setMessages(prev => [...prev, { role: "assistant", content: assistantMsg }]);
        
        // Save assistant message
        saveMessage('assistant', assistantMsg);
        
        // Check for educational milestones
        const milestoneKeywords = {
          'first number': /count|number|one|two|three/i,
          'first letter': /letter|alphabet|a|b|c/i,
          'learned colors': /color|red|blue|green|yellow/i,
          'learned shapes': /shape|circle|square|triangle/i
        };
        
        for (const [milestone, regex] of Object.entries(milestoneKeywords)) {
          if (regex.test(assistantMsg)) {
            saveProgress(extractTopic(assistantMsg), milestone);
            break;
          }
        }
        
        setCurrentAssistantMessage('');
      }
    } else if (event.type === 'error') {
      toast({
        title: "Oops!",
        description: event.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeVoiceChat(
        handleMessage,
        () => {
          setIsConnected(true);
          toast({
            title: `Connected! ${character.color === 'pink' ? '🎀' : character.color === 'red' ? '🎩' : character.color === 'blue' ? '❄️' : '🌊'}`,
            description: `${character.name} is ready to chat with you!`,
          });
        },
        () => {
          setIsConnected(false);
          setIsSpeaking(false);
          setIsListening(false);
        },
        selectedCharacter
      );
      
      await chatRef.current.connect();
      
      // Start recording automatically
      setTimeout(async () => {
        await chatRef.current?.startRecording();
      }, 1000);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
  };

  const sendTextMessage = () => {
    if (!input.trim() || !isConnected) return;
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    chatRef.current?.sendTextMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const changeCharacter = (char: Character) => {
    if (isConnected) {
      toast({
        title: "End current chat first",
        description: "Please end your current conversation before switching characters",
        variant: "destructive"
      });
      return;
    }
    setSelectedCharacter(char);
    setMessages([{ role: "assistant", content: characterConfig[char].greeting }]);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      character.color === 'pink' ? 'from-pink-100 via-purple-100 to-pink-200 dark:from-pink-950 dark:via-purple-950 dark:to-pink-900' :
      character.color === 'red' ? 'from-red-100 via-yellow-100 to-red-200 dark:from-red-950 dark:via-yellow-950 dark:to-red-900' :
      character.color === 'blue' ? 'from-blue-100 via-cyan-100 to-blue-200 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900' :
      'from-teal-100 via-green-100 to-teal-200 dark:from-teal-950 dark:via-green-950 dark:to-teal-900'
    }`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={character.img} 
              alt={character.name} 
              className={`w-16 h-16 object-contain transition-transform ${
                isSpeaking ? 'animate-bounce scale-110' : ''
              }`}
            />
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${
                character.color === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                character.color === 'red' ? 'text-red-600 dark:text-red-400' :
                character.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                'text-teal-600 dark:text-teal-400'
              }`}>Talk to {character.name}!</h1>
              <p className="text-sm text-muted-foreground">Real-time voice conversation ✨</p>
            </div>
          </div>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </div>

        {/* Character Selector */}
        {!isConnected && (
          <div className="mb-6 max-w-4xl mx-auto">
            <p className="text-sm font-semibold text-center mb-3 text-foreground">Choose Your Friend:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(characterConfig) as Character[]).map((char) => (
                <button
                  key={char}
                  onClick={() => changeCharacter(char)}
                  className={`p-4 rounded-xl border-4 transition-all ${
                    selectedCharacter === char
                      ? `border-${characterConfig[char].color}-500 bg-${characterConfig[char].color}-100 dark:bg-${characterConfig[char].color}-950 scale-105`
                      : 'border-transparent bg-background/50 hover:scale-105'
                  }`}
                >
                  <img 
                    src={characterConfig[char].img} 
                    alt={characterConfig[char].name}
                    className="w-16 h-16 mx-auto object-contain mb-2"
                  />
                  <p className="text-sm font-semibold text-center">{characterConfig[char].name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-280px)]">
            <div className="text-center mb-4">
              {!isConnected ? (
                <div className="space-y-4">
                  <p className="text-xl text-muted-foreground">
                    Click the button below to start talking with {character.name}! {
                      character.color === 'pink' ? '🎀' : 
                      character.color === 'red' ? '🎩' : 
                      character.color === 'blue' ? '❄️' : '🌊'
                    }
                  </p>
                  <Button 
                    onClick={startConversation}
                    size="lg"
                    className={`${
                      character.color === 'pink' ? 'bg-pink-500 hover:bg-pink-600' :
                      character.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                      character.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                      'bg-teal-500 hover:bg-teal-600'
                    } text-white text-xl px-8 py-6`}
                  >
                    <Phone className="mr-2 h-6 w-6" />
                    Start Voice Chat
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    {isListening && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Mic className="w-5 h-5 animate-pulse" />
                        <span className="font-semibold">Listening...</span>
                      </div>
                    )}
                    {isSpeaking && (
                      <div className={`flex items-center gap-2 ${
                        character.color === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                        character.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        character.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        'text-teal-600 dark:text-teal-400'
                      }`}>
                        <Volume2 className="w-5 h-5 animate-pulse" />
                        <span className="font-semibold">{character.name} is speaking...</span>
                      </div>
                    )}
                    {!isListening && !isSpeaking && (
                      <div className="text-muted-foreground">
                        <span>Connected - Just start talking! 🎤</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={endConversation}
                    size="sm"
                    variant="destructive"
                  >
                    <PhoneOff className="mr-2 h-4 w-4" />
                    End Chat
                  </Button>
                </div>
              )}
            </div>

            <Card className={`flex-1 p-4 mb-4 overflow-y-auto border-4 ${
              character.color === 'pink' ? 'border-pink-300 dark:border-pink-700 bg-gradient-to-b from-background to-pink-50 dark:to-pink-950/30' :
              character.color === 'red' ? 'border-red-300 dark:border-red-700 bg-gradient-to-b from-background to-red-50 dark:to-red-950/30' :
              character.color === 'blue' ? 'border-blue-300 dark:border-blue-700 bg-gradient-to-b from-background to-blue-50 dark:to-blue-950/30' :
              'border-teal-300 dark:border-teal-700 bg-gradient-to-b from-background to-teal-50 dark:to-teal-950/30'
            }`}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-2xl p-4 max-w-[80%] ${
                        msg.role === "user"
                          ? `${
                            character.color === 'pink' ? 'bg-pink-500' :
                            character.color === 'red' ? 'bg-red-500' :
                            character.color === 'blue' ? 'bg-blue-500' :
                            'bg-teal-500'
                          } text-white ml-auto`
                          : "bg-purple-100 dark:bg-purple-900 text-foreground"
                      }`}
                    >
                      <p className="text-lg leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </Card>

            {isConnected && (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Or type a message..."
                  className={`flex-1 text-lg p-6 border-4 ${
                    character.color === 'pink' ? 'border-pink-300 dark:border-pink-700' :
                    character.color === 'red' ? 'border-red-300 dark:border-red-700' :
                    character.color === 'blue' ? 'border-blue-300 dark:border-blue-700' :
                    'border-teal-300 dark:border-teal-700'
                  }`}
                />
                <Button
                  onClick={sendTextMessage}
                  size="lg"
                  disabled={!input.trim()}
                  className={`px-6 ${
                    character.color === 'pink' ? 'bg-pink-500 hover:bg-pink-600' :
                    character.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                    character.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                    'bg-teal-500 hover:bg-teal-600'
                  }`}
                >
                  <Send className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>

          {/* Learning Progress Sidebar */}
          {currentProfile && (
            <div className="lg:col-span-1">
              <LearningProgress profileId={currentProfile.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
