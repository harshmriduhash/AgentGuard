import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mic, MicOff, Volume2, Zap } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { AIThinkingInline } from "@/components/ui/ai-thinking";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
interface ChatMessage { role: Role; content: string; }

const AssistantPage = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I'm the AgentGuard Assistant. Ask me anything about your AI-generated PRs, security, or how to set up effective rules." },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"conversational" | "agentic">("conversational");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const functionsBaseUrl = import.meta.env.VITE_SUPABASE_URL.replace(".supabase.co", ".functions.supabase.co");

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!session) {
      toast({ title: "Not signed in", description: "Please sign in again.", variant: "destructive" });
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ mode, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
    } catch (err: any) {
      toast({ title: "Assistant error", description: err?.message ?? "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!loading) sendMessage(); }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast({ title: "Voice not available", description: "Your browser does not support voice input." }); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(" ");
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => { toast({ title: "Voice input error", variant: "destructive" }); setListening(false); };
    recognition.onend = () => setListening(false);
    try { recognition.start(); setListening(true); } catch { setListening(false); }
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) { toast({ title: "TTS not available" }); return; }
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold font-display flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" /> Assistant
            </h1>
            <p className="text-sm text-muted-foreground">AI-powered assistant for PR analysis and security insights.</p>
          </div>

          <Card className="h-[520px] flex flex-col border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-medium">Conversation</CardTitle>
              <Badge variant="outline" className="text-xs border-border/50">
                {mode === "agentic" ? "⚡ Agentic" : "💬 Chat"}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden pt-4">
              <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-border/30 bg-background/50 p-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border/50 text-foreground"
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        {m.role === "assistant" && (
                          <button type="button" onClick={() => speak(m.content)} className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                            <Volume2 className="h-3 w-3" /> Listen
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-card border border-border/50 rounded-xl px-4 py-3">
                      <AIThinkingInline />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button type="button" size="icon" variant={listening ? "destructive" : "outline"} onClick={listening ? undefined : startListening} className="shrink-0 border-border/50">
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about a risky PR, rules, or security..." className="bg-background/50 border-border/50 focus:border-primary/50" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant={mode === "conversational" ? "default" : "outline"} onClick={() => setMode("conversational")} className={mode === "conversational" ? "" : "border-border/50"}>Chat</Button>
                    <Button type="button" size="sm" variant={mode === "agentic" ? "default" : "outline"} onClick={() => setMode("agentic")} className={cn("gap-1.5", mode === "agentic" ? "" : "border-border/50")}>
                      <Zap className="h-3 w-3" /> Agentic
                    </Button>
                  </div>
                  <Button type="button" size="sm" onClick={sendMessage} disabled={loading} className="glow-primary">
                    {loading ? <span className="flex items-center gap-2"><span className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Thinking...</span> : "Send"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-sm">What can this assistant do?</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-none space-y-2">
                {["Explain what a high-risk PR means in practical terms", "Suggest new rules to catch risky AI-generated changes", "Outline step-by-step plans to harden your repos", "Help you design processes around AgentGuard"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-sm">Voice AI</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Use the microphone to dictate questions and the "Listen" button to hear answers.</p>
              <p className="text-xs text-muted-foreground/70">Voice runs in-browser. Analysis uses the backend AI engine.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default AssistantPage;
