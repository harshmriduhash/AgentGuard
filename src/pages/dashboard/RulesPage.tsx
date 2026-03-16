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
              <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] font-bold tracking-tight">
                <Plus className="h-4 w-4" /> Add Protocol Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-black/90 backdrop-blur-3xl shadow-2xl overflow-hidden sm:max-w-[425px]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
              <DialogHeader><DialogTitle className="font-black font-display text-2xl tracking-tight text-white">Create New Rule</DialogTitle></DialogHeader>
              <div className="space-y-6 pt-6 relative">
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Repository Registry</Label>
                  <Select value={form.repository_id} onValueChange={(v) => setForm({ ...form, repository_id: v })}>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all"><SelectValue placeholder="Select target repository" /></SelectTrigger>
                    <SelectContent className="bg-black border-white/10 text-white/80">{repos.map((r) => <SelectItem key={r.id} value={r.id} className="hover:bg-white/[0.05]">{r.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Rule Classification</Label>
                  <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-black border-white/10 text-white/80">{Object.entries(ruleTypeLabels).map(([k, v]) => <SelectItem key={k} value={k} className="hover:bg-white/[0.05]">{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Pattern Protocol</Label>
                  <Input value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} placeholder="e.g. **/*.env" className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Description Intent</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="State the objective of this rule" className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all" />
                </div>
                <Button onClick={handleCreate} className="w-full bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest h-11 mt-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">Register Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <ShimmerTable rows={4} />
        ) : rules.length === 0 ? (
          <EmptyState icon={BookOpen} title="Security Protocol Empty" description="Initialize your codebase by establishing rules to monitor AI-driven pull requests." />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent bg-white/[0.02]">
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Registry</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Classification</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Pattern</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 h-12">Status</TableHead>
                  <TableHead className="h-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule, i) => (
                  <motion.tr key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="cursor-default border-white/5 hover:bg-white/[0.03] transition-all duration-300 group">
                    <TableCell className="font-mono text-[10px] text-white/30 group-hover:text-white/60 transition-colors">{rule.repositories?.full_name ?? "—"}</TableCell>
                    <TableCell><Badge className="bg-white/5 text-white/60 border-white/10 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{ruleTypeLabels[rule.rule_type] ?? rule.rule_type}</Badge></TableCell>
                    <TableCell className="font-mono text-sm text-white/80 font-bold tracking-tight">{rule.pattern}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={rule.is_active} 
                        onCheckedChange={() => toggleRule(rule)} 
                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10 scale-90"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="h-8 w-8 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full">
                        <Trash2 className="h-4 w-4 opacity-50" />
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
