import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  risk_breakdown: Record<string, number>;
  status: string;
  created_at: string;
  repository_id: string;
  repositories?: { full_name: string | null } | null;
}

const riskLevel = (score: number | null) => {
  if (!score || score <= 33) return { label: "Low", color: "bg-success/15 text-success border-success/20" };
  if (score <= 66) return { label: "Medium", color: "bg-warning/15 text-warning border-warning/20" };
  return { label: "High", color: "bg-destructive/15 text-destructive border-destructive/20" };
};

const statusIcon = (status: string) => {
  switch (status) {
    case "pass": return <CheckCircle className="h-4 w-4 text-success" />;
    case "blocked": return <XCircle className="h-4 w-4 text-destructive" />;
    default: return <AlertTriangle className="h-4 w-4 text-warning" />;
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

  useEffect(() => {
    if (!user) return;
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("pr_analyses")
          .select("*, repositories(full_name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) {
          toast({ title: "Failed to load PR analyses", description: error.message, variant: "destructive" });
          return;
        }
        if (data) setAnalyses(data as unknown as PrAnalysis[]);
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
    const breakdown = selected.risk_breakdown || {};
    return (
      <PageTransition>
        <div className="space-y-6">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to PRs
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display">PR #{selected.pr_number}: {selected.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{selected.repositories?.full_name}</p>
          </div>
          <StaggerContainer className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Risk Score", content: <><span className="text-3xl font-bold font-mono">{selected.risk_score ?? 0}</span><span className="text-muted-foreground">/100</span></> },
              { label: "Risk Level", content: <Badge className={cn(risk.color, "text-xs")}>{risk.label}</Badge> },
              { label: "Status", content: <div className="flex items-center gap-2">{statusIcon(selected.status)}<span className="capitalize">{selected.status.replace("_", " ")}</span></div> },
            ].map((card, i) => (
              <StaggerItem key={i}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle></CardHeader>
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
          {Object.keys(breakdown).length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle>Risk Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(breakdown).map(([category, score]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="capitalize font-medium">{category.replace("_", " ")}</span>
                          <span className="font-mono text-muted-foreground">{score as number}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score as number}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={cn(
                              "h-2 rounded-full",
                              (score as number) > 66 ? "bg-destructive" : (score as number) > 33 ? "bg-warning" : "bg-success"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
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
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-card/50 border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40 bg-card/50 border-border/50"><SelectValue placeholder="Risk" /></SelectTrigger>
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
            title="No PR analyses yet"
            description="Connect a repo and run your first analysis to see results here."
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Repository</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">PR</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Risk</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a, i) => {
                  const risk = riskLevel(a.risk_score);
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="cursor-pointer border-border/30 hover:bg-accent/50 transition-colors"
                      onClick={() => setSelected(a)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{a.repositories?.full_name ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">#{a.pr_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{a.title}</TableCell>
                      <TableCell><Badge className={cn(risk.color, "text-xs border")}>{risk.label}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-2">{statusIcon(a.status)}<span className="capitalize text-xs">{a.status.replace("_", " ")}</span></div></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
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
