import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Send, Volume2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from "@/utils/audioRecorder";
import mickeyImg from "@/assets/mickey.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there! I'm your Disney friend! How can I help you today? 🎉" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kids-chat`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last.content !== userMessages[0].content) {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Speak the response
    if (assistantContent && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(assistantContent);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMsg]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again!",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      audioRecorderRef.current = new AudioRecorder();
      await audioRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "🎤 Listening...",
        description: "Speak now! Tap the mic again when done.",
      });
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to use voice chat!",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (!audioRecorderRef.current) return;

    try {
      const audioBlob = await audioRecorderRef.current.stop();
      setIsRecording(false);

      // Convert to base64 and send
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];

        // For now, just show placeholder - in production you'd use speech-to-text
        toast({
          title: "Voice feature coming soon!",
          description: "For now, please type your message 😊",
        });
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Failed to process recording. Please try again!",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src={mickeyImg} alt="Mickey" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Disney AI Friend</h1>
          </div>
          <Link to="/">
            <Button size="lg" variant="outline" className="text-lg">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </div>

        <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xl text-muted-foreground">
              Ask me anything! I love to chat and help! 🌟
            </p>
          </div>

        <Card className="flex-1 p-4 mb-4 overflow-y-auto border-4 border-primary/20 bg-gradient-to-b from-background to-muted/30">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl p-4 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-lg leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-2xl p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            variant={isRecording ? "destructive" : "secondary"}
            className="px-6"
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 text-lg p-6 border-4 border-border"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            size="lg"
            disabled={!input.trim() || isLoading}
            className="px-6"
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>
        
        {isSpeaking && (
          <div className="text-center mt-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4 animate-pulse" />
            Speaking...
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
