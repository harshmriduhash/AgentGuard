import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ShimmerTable } from "@/components/ui/shimmer";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { motion } from "framer-motion";
import { HoverCardInfo } from "@/components/ui/hover-card-info";

interface Agent {
  id: string;
  name: string;
  trust_score: number;
  total_prs: number;
  violations_count: number;
  approvals_count: number;
}

const trustColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
};

const trustBarColor = (score: number) => {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
};

const AgentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", user.id)
          .order("trust_score", { ascending: false });
        if (error) {
          toast({ title: "Failed to load agents", description: error.message, variant: "destructive" });
        }
        if (data) setAgents(data);
      } catch (err: any) {
        toast({ title: "Error", description: err?.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [user, toast]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Agents</h1>
          <p className="text-sm text-muted-foreground">Track AI agents & their trust scores</p>
        </div>

        {loading ? (
          <ShimmerTable rows={4} />
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No agents detected yet"
            description="Agents are auto-discovered when PRs are analyzed. Connect a repo and run your first analysis."
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Agent</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Trust Score</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Total PRs</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Violations</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Approvals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent, i) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-border/30 hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <HoverCardInfo
                        trigger={
                          <span className="cursor-help border-b border-dotted border-muted-foreground/30">{agent.name}</span>
                        }
                      >
                        <div className="space-y-2">
                          <p className="font-semibold">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">AI agent with {agent.total_prs} analyzed PRs and a trust score of {agent.trust_score}/100.</p>
                        </div>
                      </HoverCardInfo>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${agent.trust_score}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={cn("h-2 rounded-full", trustBarColor(agent.trust_score))}
                          />
                        </div>
                        <span className={cn("text-sm font-mono", trustColor(agent.trust_score))}>{agent.trust_score}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{agent.total_prs}</TableCell>
                    <TableCell><span className="text-destructive font-mono text-sm">{agent.violations_count}</span></TableCell>
                    <TableCell><span className="text-success font-mono text-sm">{agent.approvals_count}</span></TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default AgentsPage;
