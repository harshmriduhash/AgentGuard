import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  if (!score || score <= 33) return { label: "Low", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  if (score <= 66) return { label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  return { label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" };
};

const statusIcon = (status: string) => {
  switch (status) {
    case "pass": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    case "blocked": return <XCircle className="h-4 w-4 text-red-400" />;
    default: return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  }
};

const PRsPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<PrAnalysis[]>([]);
  const [selected, setSelected] = useState<PrAnalysis | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    const fetchAnalyses = async () => {
      const { data } = await supabase
        .from("pr_analyses")
        .select("*, repositories(full_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setAnalyses(data as unknown as PrAnalysis[]);
    };
    fetchAnalyses();
  }, [user]);

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
      <div className="space-y-6">
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to PRs
        </button>
        <div>
          <h1 className="text-2xl font-bold">PR #{selected.pr_number}: {selected.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{selected.repositories?.full_name}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Risk Score</CardTitle></CardHeader>
            <CardContent><span className="text-3xl font-bold">{selected.risk_score ?? 0}</span><span className="text-muted-foreground">/100</span></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Risk Level</CardTitle></CardHeader>
            <CardContent><Badge className={risk.color}>{risk.label}</Badge></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">{statusIcon(selected.status)}<span className="capitalize">{selected.status.replace("_", " ")}</span></CardContent>
          </Card>
        </div>
        {selected.summary && (
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.summary}</p></CardContent>
          </Card>
        )}
        {Object.keys(breakdown).length > 0 && (
          <Card>
            <CardHeader><CardTitle>Risk Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(breakdown).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{category.replace("_", " ")}</span>
                      <span>{score as number}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${score as number}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pull Requests</h1>
          <p className="text-sm text-muted-foreground">All analyzed PRs across your repositories</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pass">Pass</SelectItem>
            <SelectItem value="needs_review">Needs Review</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No PR analyses yet. Connect a repo and run your first analysis.</p>
        </Card>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>PR</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const risk = riskLevel(a.risk_score);
                return (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                    <TableCell className="font-mono text-xs">{a.repositories?.full_name ?? "—"}</TableCell>
                    <TableCell>#{a.pr_number}</TableCell>
                    <TableCell className="max-w-xs truncate">{a.title}</TableCell>
                    <TableCell><Badge className={risk.color}>{risk.label}</Badge></TableCell>
                    <TableCell className="flex items-center gap-2">{statusIcon(a.status)}<span className="capitalize text-xs">{a.status.replace("_", " ")}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PRsPage;
