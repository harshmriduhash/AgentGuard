import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShimmerTable } from "@/components/ui/shimmer";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { motion } from "framer-motion";

interface Repository { id: string; full_name: string | null; }
interface Rule {
  id: string; repository_id: string; rule_type: string; pattern: string;
  description: string | null; is_active: boolean;
  repositories?: { full_name: string | null } | null;
}

const ruleTypeLabels: Record<string, string> = {
  file_path_restriction: "File Path", directory_restriction: "Directory",
  sensitive_pattern: "Sensitive Pattern", approval_required_path: "Approval Required",
};

const RulesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ repository_id: "", rule_type: "file_path_restriction", pattern: "", description: "" });
  const [loading, setLoading] = useState(false);

  const fetchRules = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("rules").select("*, repositories(full_name)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load rules", description: error.message, variant: "destructive" });
    if (data) setRules(data as unknown as Rule[]);
    setLoading(false);
  };

  const fetchRepos = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("repositories").select("id, full_name").eq("user_id", user.id);
    if (error) toast({ title: "Failed to load repos", description: error.message, variant: "destructive" });
    if (data) setRepos(data as Repository[]);
  };

  useEffect(() => { fetchRules(); fetchRepos(); }, [user]);

  const handleCreate = async () => {
    if (!user || !form.repository_id || !form.pattern) return;
    const { error } = await supabase.from("rules").insert({
      user_id: user.id, repository_id: form.repository_id,
      rule_type: form.rule_type as any, pattern: form.pattern,
      description: form.description || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); setForm({ repository_id: "", rule_type: "file_path_restriction", pattern: "", description: "" }); fetchRules(); }
  };

  const toggleRule = async (rule: Rule) => {
    const { error } = await supabase.from("rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRules();
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase.from("rules").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRules();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">Rules</h1>
            <p className="text-sm text-muted-foreground">Define code review rules for your repositories</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 glow-primary"><Plus className="h-4 w-4" /> Add Rule</Button>
            </DialogTrigger>
            <DialogContent className="border-border/50 bg-card">
              <DialogHeader><DialogTitle className="font-display">Create Rule</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Repository</Label>
                  <Select value={form.repository_id} onValueChange={(v) => setForm({ ...form, repository_id: v })}>
                    <SelectTrigger className="bg-background/50 border-border/50"><SelectValue placeholder="Select repo" /></SelectTrigger>
                    <SelectContent>{repos.map((r) => <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Rule Type</Label>
                  <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                    <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(ruleTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pattern</Label>
                  <Input value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} placeholder="e.g. **/*.env" className="bg-background/50 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this rule checks for" className="bg-background/50 border-border/50" />
                </div>
                <Button onClick={handleCreate} className="w-full glow-primary">Create Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <ShimmerTable rows={4} />
        ) : rules.length === 0 ? (
          <EmptyState icon={BookOpen} title="No rules yet" description="Add a repository first, then create rules to enforce on AI-generated PRs." />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Repository</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Pattern</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule, i) => (
                  <motion.tr key={rule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-border/30 hover:bg-accent/50 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{rule.repositories?.full_name ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs border-border/50">{ruleTypeLabels[rule.rule_type] ?? rule.rule_type}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{rule.pattern}</TableCell>
                    <TableCell><Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule)} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

export default RulesPage;
