import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  trust_score: number;
  total_prs: number;
  violations_count: number;
  approvals_count: number;
}

const trustColor = (score: number) => {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
};

const AgentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("agents")
      .select("*")
      .eq("user_id", user.id)
      .order("trust_score", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast({
            title: "Failed to load agents",
            description: error.message,
            variant: "destructive",
          });
        }
        if (data) setAgents(data);
      })
      .finally(() => setLoading(false));
  }, [user, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-sm text-muted-foreground">Track AI agents & their trust scores</p>
      </div>

      {loading ? (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">Loading agents...</p>
        </Card>
      ) : agents.length === 0 ? (
        <Card className="py-12 text-center">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No agents detected yet. Agents are auto-discovered when PRs are analyzed.</p>
        </Card>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Total PRs</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Approvals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-secondary">
                        <div
                          className={cn("h-2 rounded-full", agent.trust_score >= 70 ? "bg-emerald-500" : agent.trust_score >= 40 ? "bg-yellow-500" : "bg-red-500")}
                          style={{ width: `${agent.trust_score}%` }}
                        />
                      </div>
                      <span className={cn("text-sm font-mono", trustColor(agent.trust_score))}>{agent.trust_score}</span>
                    </div>
                  </TableCell>
                  <TableCell>{agent.total_prs}</TableCell>
                  <TableCell><span className="text-red-400">{agent.violations_count}</span></TableCell>
                  <TableCell><span className="text-emerald-400">{agent.approvals_count}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;
