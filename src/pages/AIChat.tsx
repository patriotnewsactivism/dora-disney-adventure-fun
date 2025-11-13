import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Send, Volume2, Home, Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeVoiceChat } from "@/utils/RealtimeVoice";
import minnieImg from "@/assets/minnie.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Oh boy! Hi there! I'm Minnie Mouse! How wonderful to meet you! What would you like to talk about today? 🎀✨" }
  ]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

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
      }
    } else if (event.type === 'response.audio_transcript.delta') {
      const delta = event.delta;
      if (delta) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content.includes("Oh boy!")) {
            return prev.map((m, i) => 
              i === prev.length - 1 
                ? { ...m, content: m.content + delta } 
                : m
            );
          }
          return [...prev, { role: "assistant", content: delta }];
        });
      }
    } else if (event.type === 'response.audio_transcript.done') {
      // Transcript complete
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
            title: "Connected! 🎀",
            description: "Minnie Mouse is ready to chat with you!",
          });
        },
        () => {
          setIsConnected(false);
          setIsSpeaking(false);
          setIsListening(false);
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 dark:from-pink-950 dark:via-purple-950 dark:to-pink-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src={minnieImg} alt="Minnie Mouse" className="w-16 h-16 object-contain animate-bounce" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-pink-600 dark:text-pink-400">Talk to Minnie Mouse!</h1>
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

        <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
          <div className="text-center mb-4">
            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-xl text-muted-foreground">
                  Click the button below to start talking with Minnie! 🎀
                </p>
                <Button 
                  onClick={startConversation}
                  size="lg"
                  className="bg-pink-500 hover:bg-pink-600 text-white text-xl px-8 py-6"
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
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      <span className="font-semibold">Minnie is speaking...</span>
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

          <Card className="flex-1 p-4 mb-4 overflow-y-auto border-4 border-pink-300 dark:border-pink-700 bg-gradient-to-b from-background to-pink-50 dark:to-pink-950/30">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl p-4 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-pink-500 text-white ml-auto"
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
                className="flex-1 text-lg p-6 border-4 border-pink-300 dark:border-pink-700"
              />
              <Button
                onClick={sendTextMessage}
                size="lg"
                disabled={!input.trim()}
                className="px-6 bg-pink-500 hover:bg-pink-600"
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
