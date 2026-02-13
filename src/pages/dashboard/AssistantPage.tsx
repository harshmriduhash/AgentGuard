import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mic, MicOff, Volume2, Zap } from "lucide-react";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

const AssistantPage = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm the AgentGuard Assistant. Ask me anything about your AI-generated PRs, security, or how to set up effective rules.",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"conversational" | "agentic">("conversational");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const functionsBaseUrl = import.meta.env.VITE_SUPABASE_URL.replace(
    ".supabase.co",
    ".functions.supabase.co",
  );

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!session) {
      toast({
        title: "Not signed in",
        description: "Please sign in again to use the assistant.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${functionsBaseUrl}/chat-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          mode,
          messages: nextMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get assistant response");
      }

      const reply: ChatMessage = {
        role: "assistant",
        content: data.reply as string,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      toast({
        title: "Assistant error",
        description: err?.message ?? "Something went wrong while talking to the assistant.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        sendMessage();
      }
    }
  };

  const startListening = () => {
    // Browser-based voice input via Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Voice not available",
        description: "Your browser does not support voice input.",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ");
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => {
      toast({
        title: "Voice input error",
        description: "Something went wrong while listening. Try again.",
        variant: "destructive",
      });
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast({
        title: "Voice playback not available",
        description: "Your browser does not support text-to-speech.",
      });
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Conversational & agentic AI to help you reason about AI-generated PRs, rules, and risk.
          </p>
        </div>

        <Card className="h-[520px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Conversation</CardTitle>
            <Badge variant="outline" className="text-xs">
              Mode: {mode === "agentic" ? "Agentic (action plans)" : "Conversational"}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speak(m.content)}
                        className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        <Volume2 className="h-3 w-3" />
                        Listen
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Ask the assistant about your rules, PR analysis results, or how to harden your
                  AI-generated code review process.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant={listening ? "destructive" : "outline"}
                  onClick={listening ? undefined : startListening}
                  className="shrink-0"
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a risky PR, how to design rules, or how to improve your AI review pipeline..."
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "conversational" ? "default" : "outline"}
                    onClick={() => setMode("conversational")}
                  >
                    Chat
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "agentic" ? "default" : "outline"}
                    onClick={() => setMode("agentic")}
                    className="gap-1.5"
                  >
                    <Zap className="h-3 w-3" />
                    Agentic
                  </Button>
                </div>
                <Button type="button" size="sm" onClick={sendMessage} disabled={loading}>
                  {loading ? "Thinking..." : "Send"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">What can this assistant do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-4">
              <li>Explain what a high-risk PR means in practical terms.</li>
              <li>Suggest new rules to catch risky AI-generated changes.</li>
              <li>Outline step-by-step plans to harden your repos.</li>
              <li>Help you design processes around AgentGuard in your team.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Voice AI (browser-based)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Use the microphone button to dictate your questions (if your browser supports the Web
              Speech API), and the “Listen” button to hear answers read aloud.
            </p>
            <p className="text-xs">
              Voice input and playback run in the browser; PR analysis still uses the backend AI
              engine.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssistantPage;

