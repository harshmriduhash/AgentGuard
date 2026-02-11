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

interface Repository { id: string; full_name: string | null; }
interface Rule {
  id: string;
  repository_id: string;
  rule_type: string;
  pattern: string;
  description: string | null;
  is_active: boolean;
  repositories?: { full_name: string | null } | null;
}

const ruleTypeLabels: Record<string, string> = {
  file_path_restriction: "File Path Restriction",
  directory_restriction: "Directory Restriction",
  sensitive_pattern: "Sensitive Pattern",
  approval_required_path: "Approval Required Path",
};

const RulesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ repository_id: "", rule_type: "file_path_restriction", pattern: "", description: "" });

  const fetchRules = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("rules")
      .select("*, repositories(full_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRules(data as unknown as Rule[]);
  };

  const fetchRepos = async () => {
    if (!user) return;
    const { data } = await supabase.from("repositories").select("id, full_name").eq("user_id", user.id);
    if (data) setRepos(data as Repository[]);
  };

  useEffect(() => { fetchRules(); fetchRepos(); }, [user]);

  const handleCreate = async () => {
    if (!user || !form.repository_id || !form.pattern) return;
    const { error } = await supabase.from("rules").insert({
      user_id: user.id,
      repository_id: form.repository_id,
      rule_type: form.rule_type as any,
      pattern: form.pattern,
      description: form.description || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDialogOpen(false);
      setForm({ repository_id: "", rule_type: "file_path_restriction", pattern: "", description: "" });
      fetchRules();
    }
  };

  const toggleRule = async (rule: Rule) => {
    await supabase.from("rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    fetchRules();
  };

  const deleteRule = async (id: string) => {
    await supabase.from("rules").delete().eq("id", id);
    fetchRules();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rules</h1>
          <p className="text-sm text-muted-foreground">Define code review rules for your repositories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Rule</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Repository</Label>
                <Select value={form.repository_id} onValueChange={(v) => setForm({ ...form, repository_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select repo" /></SelectTrigger>
                  <SelectContent>
                    {repos.map((r) => <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ruleTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pattern</Label>
                <Input value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} placeholder="e.g. **/*.env or /api/keys/*" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this rule checks for" />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Rule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No rules yet. Add a repository first, then create rules.</p>
        </Card>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead>Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-xs">{rule.repositories?.full_name ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{ruleTypeLabels[rule.rule_type] ?? rule.rule_type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{rule.pattern}</TableCell>
                  <TableCell><Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule)} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RulesPage;
