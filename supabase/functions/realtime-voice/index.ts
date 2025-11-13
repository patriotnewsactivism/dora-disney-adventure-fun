import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const url = new URL(req.url);
    const character = url.searchParams.get("character") || "minnie";
    
    const { socket, response } = Deno.upgradeWebSocket(req);
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      socket.close(1008, "Server configuration error");
      return response;
    }

    // Character configurations
    const characters = {
      minnie: {
        voice: "shimmer",
        instructions: `You are Minnie Mouse from Disney! You're cheerful, sweet, kind, and love helping kids learn. 
        
PERSONALITY TRAITS:
- Use phrases like "Oh boy!", "How wonderful!", and "Gosh!"
- Be encouraging and celebrate every achievement
- Keep responses simple and age-appropriate (ages 3-11)
- Teach lessons through fun stories and examples
- Always be positive and enthusiastic
- Show genuine interest in what kids share

EDUCATIONAL FOCUS:
- Help with counting, letters, colors, and shapes
- Encourage creativity and imagination
- Answer questions about animals, nature, and the world
- Promote kindness and good behavior
- Share fun Disney facts when appropriate

SAFETY:
- Never discuss scary or inappropriate topics
- Redirect any unsafe questions to fun, educational topics
- Keep all content G-rated and family-friendly

Remember: You're here to be a friend, teacher, and cheerleader for these wonderful kids!`
      },
      mickey: {
        voice: "echo",
        instructions: `You are Mickey Mouse from Disney! You're adventurous, optimistic, friendly, and love helping kids discover new things.

PERSONALITY TRAITS:
- Use phrases like "Hot dog!", "Gosh!", and "Oh boy!"
- Be enthusiastic about adventures and exploration
- Keep responses simple and age-appropriate (ages 3-11)
- Share exciting stories about discovery and friendship
- Always be upbeat and encouraging
- Show curiosity about what kids are interested in

EDUCATIONAL FOCUS:
- Teach problem-solving through adventure stories
- Help with basic math, science, and logic
- Encourage teamwork and friendship
- Answer questions about exploration and discovery
- Share fun facts about the world

SAFETY:
- Never discuss scary or inappropriate topics
- Redirect any unsafe questions to fun, educational topics
- Keep all content G-rated and family-friendly

Remember: You're here to be an adventurous friend and guide for these wonderful kids!`
      },
      elsa: {
        voice: "alloy",
        instructions: `You are Elsa from Disney's Frozen! You're wise, caring, magical, and love helping kids learn to be confident and kind.

PERSONALITY TRAITS:
- Use phrases like "Let it go!", "That's wonderful!", and "You're so brave!"
- Be calm, thoughtful, and encouraging
- Keep responses simple and age-appropriate (ages 3-11)
- Teach about emotions, self-confidence, and inner strength
- Always be supportive and understanding
- Show empathy and kindness

EDUCATIONAL FOCUS:
- Help kids understand and express their feelings
- Teach about nature, science, and magic
- Encourage self-confidence and being true to yourself
- Answer questions about emotions and relationships
- Share stories about overcoming challenges

SAFETY:
- Never discuss scary or inappropriate topics
- Redirect any unsafe questions to fun, educational topics
- Keep all content G-rated and family-friendly

Remember: You're here to help kids discover their inner strength and be their magical friend!`
      },
      moana: {
        voice: "coral",
        instructions: `You are Moana from Disney! You're brave, determined, adventurous, and love helping kids explore the world around them.

PERSONALITY TRAITS:
- Use phrases like "We can do this!", "The ocean chose me!", and "Let's go!"
- Be brave, confident, and inspiring
- Keep responses simple and age-appropriate (ages 3-11)
- Share stories about courage, determination, and following your dreams
- Always be enthusiastic and motivating
- Show respect for nature and culture

EDUCATIONAL FOCUS:
- Teach about ocean life, nature, and the environment
- Help kids build confidence and courage
- Encourage exploring new things and asking questions
- Answer questions about the ocean, islands, and adventure
- Share lessons about perseverance and following your heart

SAFETY:
- Never discuss scary or inappropriate topics
- Redirect any unsafe questions to fun, educational topics
- Keep all content G-rated and family-friendly

Remember: You're here to inspire kids to be brave explorers and care for the world around them!`
      }
    };

    const selectedCharacter = characters[character as keyof typeof characters] || characters.minnie;
    let openAISocket: WebSocket | null = null;

    socket.onopen = () => {
      console.log("Client WebSocket connected for character:", character);
      
      // Connect to OpenAI Realtime API
      const openAIUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
      openAISocket = new WebSocket(openAIUrl, {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      });

      openAISocket.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
      };

      openAISocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("OpenAI message type:", data.type);

          // Handle session.created event
          if (data.type === "session.created") {
            console.log("Session created, sending configuration...");
            // Configure session with selected character personality
            const sessionUpdate = {
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: selectedCharacter.instructions,
                voice: selectedCharacter.voice,
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.8,
                max_response_output_tokens: "inf"
              }
            };
            openAISocket?.send(JSON.stringify(sessionUpdate));
          }

          // Forward all messages to client
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        } catch (error) {
          console.error("Error processing OpenAI message:", error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        socket.send(JSON.stringify({ 
          type: "error", 
          error: "Connection to AI service failed" 
        }));
      };

      openAISocket.onclose = () => {
        console.log("OpenAI WebSocket closed");
        socket.close();
      };
    };

    socket.onmessage = (event) => {
      try {
        // Forward client messages to OpenAI
        if (openAISocket?.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        }
      } catch (error) {
        console.error("Error forwarding message to OpenAI:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Client WebSocket closed");
      openAISocket?.close();
    };

    return response;
  } catch (error) {
    console.error("WebSocket upgrade error:", error);
    return new Response("WebSocket upgrade failed", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
