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
  if (score >= 70) return "text-white";
  if (score >= 40) return "text-white/60";
  return "text-white/30";
};

const trustBarColor = (score: number) => {
  if (score >= 70) return "bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]";
  if (score >= 40) return "bg-white/40";
  return "bg-white/10";
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
            title="Neural Network Isolated"
            description="Agents are auto-discovered as they interact with the shipyard. Initiate an analysis to map the perimeter."
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent bg-white/[0.02]">
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Entity</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Trust Coefficient</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Activity</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Violations</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Validations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent, i) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="cursor-default border-white/5 hover:bg-white/[0.03] transition-all duration-300 group"
                  >
                    <TableCell className="font-bold tracking-tight text-white/90">
                      <HoverCardInfo
                        trigger={
                          <span className="cursor-help border-b border-white/10 hover:border-white/40 transition-colors uppercase text-xs tracking-widest">{agent.name}</span>
                        }
                      >
                        <div className="space-y-3 p-1">
                          <p className="font-black uppercase tracking-[0.2em] text-[10px] text-white/30">Entity Signature</p>
                          <p className="font-bold text-lg text-white">{agent.name}</p>
                          <p className="text-[11px] text-white/40 leading-relaxed font-light">Autonomous agent with {agent.total_prs} recorded interactions. Current reliability index: <span className="font-mono text-white/80">{agent.trust_score}%</span></p>
                        </div>
                      </HoverCardInfo>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="h-1 w-24 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${agent.trust_score}%` }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                            className={cn("h-full rounded-full transition-all duration-1000", trustBarColor(agent.trust_score))}
                          />
                        </div>
                        <span className={cn("text-xs font-mono font-bold tracking-tighter", trustColor(agent.trust_score))}>{agent.trust_score}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/40 group-hover:text-white/80 transition-colors">{agent.total_prs} logs</TableCell>
                    <TableCell><span className="text-white font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/[0.05] border border-white/5">{agent.violations_count}</span></TableCell>
                    <TableCell><span className="text-white font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/[0.1] border border-white/10">{agent.approvals_count}</span></TableCell>
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
