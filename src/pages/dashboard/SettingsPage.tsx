import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import { Shimmer } from "@/components/ui/shimmer";
import { motion } from "framer-motion";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ display_name: "", organization: "" });
  const [repos, setRepos] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [repoForm, setRepoForm] = useState({ owner: "", name: "" });
  const [repoDialogOpen, setRepoDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("repositories").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    ]).then(([profileRes, reposRes, subRes]) => {
      if (profileRes.data) setProfile({ display_name: profileRes.data.display_name || "", organization: profileRes.data.organization || "" });
      if (reposRes.data) setRepos(reposRes.data);
      if (subRes.data) setSubscription(subRes.data);
      setLoadingProfile(false);
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: profile.display_name, organization: profile.organization }).eq("id", user.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  const addRepo = async () => {
    if (!user || !repoForm.owner || !repoForm.name) return;
    const { error } = await supabase.from("repositories").insert({ user_id: user.id, owner: repoForm.owner, name: repoForm.name });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setRepoDialogOpen(false);
      setRepoForm({ owner: "", name: "" });
      const { data } = await supabase.from("repositories").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setRepos(data);
    }
  };

  const deleteRepo = async (id: string) => {
    const { error } = await supabase.from("repositories").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRepos(repos.filter((r) => r.id !== id));
  };

  const planLabels: Record<string, string> = { free: "Free", starter: "Starter — $29/mo", pro: "Pro — $99/mo" };

  return (
    <PageTransition>
      <StaggerContainer className="space-y-8 max-w-2xl">
        <StaggerItem>
          <h1 className="text-2xl font-bold font-display">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, repositories, and subscription</p>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="font-display">Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loadingProfile ? (
                <div className="space-y-4">
                  <Shimmer className="h-10 w-full" />
                  <Shimmer className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Name</Label>
                    <Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Organization</Label>
                    <Input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} className="bg-background/50 border-border/50" />
                  </div>
                  <Button onClick={saveProfile} disabled={saving} className="glow-primary">
                    {saving ? <span className="flex items-center gap-2"><span className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Saving...</span> : "Save"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Connected Repositories</CardTitle>
              <Dialog open={repoDialogOpen} onOpenChange={setRepoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 border-border/50"><Plus className="h-4 w-4" /> Add Repo</Button>
                </DialogTrigger>
                <DialogContent className="border-border/50 bg-card">
                  <DialogHeader><DialogTitle className="font-display">Add Repository</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Owner / Organization</Label>
                      <Input value={repoForm.owner} onChange={(e) => setRepoForm({ ...repoForm, owner: e.target.value })} placeholder="e.g. my-org" className="bg-background/50 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Repository Name</Label>
                      <Input value={repoForm.name} onChange={(e) => setRepoForm({ ...repoForm, name: e.target.value })} placeholder="e.g. my-app" className="bg-background/50 border-border/50" />
                    </div>
                    <Button onClick={addRepo} className="w-full glow-primary">Add Repository</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {repos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No repositories connected yet.</p>
              ) : (
                <div className="space-y-2">
                  {repos.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-3 hover:border-primary/20 transition-colors"
                    >
                      <span className="font-mono text-sm">{r.full_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.is_active ? "default" : "outline"} className="text-xs">{r.is_active ? "Active" : "Inactive"}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => deleteRepo(r.id)} className="hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="font-display">Subscription</CardTitle></CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Plan:</span>
                    <Badge className="border-primary/20 bg-primary/10 text-primary">{planLabels[subscription.plan] ?? subscription.plan}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">PR Checks:</span>
                    <span className="font-mono text-sm">{subscription.pr_checks_used} / {subscription.pr_checks_limit}</span>
                  </div>
                  <div className="h-2 w-full max-w-xs rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (subscription.pr_checks_used / subscription.pr_checks_limit) * 100)}%` }}
                      transition={{ duration: 1 }}
                      className="h-2 rounded-full bg-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Shimmer className="h-6 w-32" />
                  <Shimmer className="h-4 w-48" />
                  <Shimmer className="h-2 w-64" />
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
};

export default SettingsPage;
