import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ShimmerTable } from "@/components/ui/shimmer";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import { motion } from "framer-motion";

interface PrAnalysis {
  id: string;
  pr_number: number;
  title: string;
  summary: string | null;
  risk_score: number | null;
  status: string;
  created_at: string;
  repo_name: string; // Updated from repositories join
  risk_breakdown?: Record<string, number>;
}

const riskLevel = (score: number | null) => {
  if (!score || score <= 33) return { label: "Low", color: "bg-white/5 text-white/60 border-white/10" };
  if (score <= 66) return { label: "Medium", color: "bg-white/10 text-white/80 border-white/20" };
  return { label: "High", color: "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" };
};

const statusIcon = (status: string) => {
  switch (status) {
    case "pass": return <CheckCircle className="h-4 w-4 text-white/60" />;
    case "blocked": return <XCircle className="h-4 w-4 text-white" />;
    default: return <AlertTriangle className="h-4 w-4 text-white/40" />;
  }
};

const PRsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<PrAnalysis[]>([]);
  const [selected, setSelected] = useState<PrAnalysis | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/prs", {
          headers: {
            "x-user-id": user.id,
          }
        });
        if (!response.ok) throw new Error("Failed to fetch PRs");
        const data = await response.json();
        setAnalyses(data);
      } catch (err: any) {
        toast({ title: "Unexpected error", description: err?.message ?? "Something went wrong.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, [user, toast]);

  const filtered = analyses.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (riskFilter !== "all") {
      const level = riskLevel(a.risk_score).label.toLowerCase();
      if (level !== riskFilter) return false;
    }
    return true;
  });

  if (selected) {
    const risk = riskLevel(selected.risk_score);
    const breakdown = (selected?.risk_breakdown as Record<string, number>) || {};
    return (
      <PageTransition>
        <div className="space-y-6">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to PRs
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display">PR #{selected.pr_number}: {selected.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{selected.repo_name}</p>
          </div>
          <StaggerContainer className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Risk Score", content: <><span className="text-4xl font-black font-mono text-white">{selected.risk_score ?? 0}</span><span className="text-white/20 ml-1">/100</span></> },
              { label: "Risk Level", content: <Badge className={cn(risk.color, "text-[10px] font-bold uppercase tracking-widest px-3 py-1")}>{risk.label}</Badge> },
              { label: "Status", content: <div className="flex items-center gap-2 text-white/80">{statusIcon(selected.status)}<span className="capitalize text-sm font-medium tracking-wide">{selected.status.replace("_", " ")}</span></div> },
            ].map((card, i) => (
              <StaggerItem key={i}>
                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">{card.label}</CardTitle></CardHeader>
                  <CardContent>{card.content}</CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
          {selected.summary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selected.summary}</p></CardContent>
              </Card>
            </motion.div>
          )}
          {/* Risk Analysis Breakdown permanently disabled for migration until new schema supports it */}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">Pull Requests</h1>
            <p className="text-sm text-muted-foreground">All analyzed PRs across your repositories</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50 border-border/50"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <ShimmerTable rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Analysis Logs Empty"
            description="Your neural engine is ready. Connect a repository to begin the security protocol."
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent bg-white/[0.02]">
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Registry</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">ID</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Subject</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Threat</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Policy</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a, i) => {
                  const risk = riskLevel(a.risk_score);
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="cursor-pointer border-white/5 hover:bg-white/[0.03] transition-all duration-300 group"
                      onClick={() => setSelected(a)}
                    >
                      <TableCell className="font-mono text-[10px] text-white/30 group-hover:text-white/60 transition-colors">{a.repo_name ?? "—"}</TableCell>
                      <TableCell className="font-mono text-[10px] text-white/80 font-bold tracking-tight">#{a.pr_number}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-white/90 font-medium">{a.title}</TableCell>
                      <TableCell><Badge className={cn(risk.color, "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-0")}>{risk.label}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-2">{statusIcon(a.status)}<span className="capitalize text-[10px] font-bold tracking-widest text-white/40 group-hover:text-white/80 transition-colors">{a.status.replace("_", " ")}</span></div></TableCell>
                      <TableCell className="text-[10px] font-mono text-white/20 group-hover:text-white/50">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default PRsPage;
