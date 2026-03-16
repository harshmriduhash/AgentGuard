import { useUser } from "@clerk/clerk-react";
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
import { useState } from "react"; // Added useState import

type Role = "user" | "assistant";
interface ChatMessage { role: Role; content: string; }

const AssistantPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I'm the AgentGuard Assistant. Ask me anything about your AI-generated PRs, security, or how to set up effective rules." },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"conversational" | "agentic">("conversational");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);


  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in again.", variant: "destructive" });
      return;
    }
    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
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

          <Card className="h-[600px] flex flex-col border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Neural Interface</CardTitle>
              <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-0", mode === "agentic" ? "bg-white text-black" : "bg-white/10 text-white/60")}>
                {mode === "agentic" ? "Agentic Protocol" : "Conversational"}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6 overflow-hidden pt-6 relative">
              <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/5 bg-black/20 p-6 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {messages.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-xl transition-all duration-300",
                        m.role === "user"
                          ? "bg-white text-black font-bold tracking-tight"
                          : "bg-white/[0.05] border border-white/10 text-white/80 backdrop-blur-md"
                      )}>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        {m.role === "assistant" && (
                          <button type="button" onClick={() => speak(m.content)} className="mt-3 flex items-center gap-2 text-[9px] uppercase font-black tracking-widest text-white/30 hover:text-white transition-colors group/btn">
                            <Volume2 className="h-3 w-3 opacity-50 group-hover/btn:opacity-100" /> Listen Logic
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 backdrop-blur-md shadow-lg">
                      <AIThinkingInline />
                    </div>
                  </motion.div>
                )}
              </div>
 
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <Button type="button" size="icon" variant={listening ? "destructive" : "outline"} onClick={listening ? undefined : startListening} className={cn("shrink-0 h-12 w-12 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all", listening && "animate-pulse")}>
                    {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Textarea 
                    rows={1} 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                    placeholder="Dispatch command to neural core..." 
                    className="bg-white/[0.03] border-white/10 text-white/80 focus:ring-white/20 min-h-[48px] max-h-32 py-3 px-4 rounded-xl transition-all resize-none shadow-inner" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setMode("conversational")}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300",
                        mode === "conversational" ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white/60"
                      )}
                    >
                      Chat
                    </button>
                    <button 
                      onClick={() => setMode("agentic")}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center gap-1.5",
                        mode === "agentic" ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white/60"
                      )}
                    >
                      <Zap className="h-3 w-3" /> Agentic
                    </button>
                  </div>
                  <Button type="button" size="sm" onClick={sendMessage} disabled={loading} className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest px-8 h-10 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all active:scale-95">
                    {loading ? "Processing..." : "Dispatch"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative shadow-xl">
             <CardHeader><CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Capabilities Registry</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-xs text-white/50 pb-6">
              <ul className="list-none space-y-4">
                {[
                  "Deconstruct complex high-risk PR anomalies", 
                  "Automate custom policy derivation", 
                  "Synthesize repository hardening stratagems", 
                  "Architect AgentGuard operational flows"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 group/item">
                    <div className="h-2 w-2 rounded-full bg-white/10 mt-1 shrink-0 group-hover/item:bg-white transition-all shadow-[0_0_8px_rgba(255,255,255,0)] group-hover/item:shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    <span className="leading-relaxed group-hover/item:text-white/80 transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative shadow-xl">
            <CardHeader><CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Neural Synthesis</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs text-white/40 pb-6">
              <p className="leading-relaxed">Biometric voice protocols enabled. Dictate commands via peripheral uplink.</p>
              <p className="text-[10px] text-white/20 font-mono">End-to-end encryption active. Responses synthesized via neural core.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default AssistantPage;
