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
import { cn } from "@/lib/utils";

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
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <CardHeader><CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">User Profile Registry</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-2">
              {loadingProfile ? (
                <div className="space-y-4">
                  <Shimmer className="h-11 w-full opacity-20" />
                  <Shimmer className="h-11 w-full opacity-20" />
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Display Name</Label>
                    <Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all font-medium" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Organization Identifier</Label>
                    <Input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all font-medium" />
                  </div>
                  <Button onClick={saveProfile} disabled={saving} className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest h-11 px-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {saving ? <span className="flex items-center gap-2"><span className="h-3 w-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Synchronizing...</span> : "Register Protocol"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Registry Protocols</CardTitle>
              <Dialog open={repoDialogOpen} onOpenChange={setRepoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest px-4"><Plus className="h-3 w-3" /> Register Repo</Button>
                </DialogTrigger>
                <DialogContent className="border-white/10 bg-black/90 backdrop-blur-3xl shadow-2xl overflow-hidden sm:max-w-[425px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                  <DialogHeader><DialogTitle className="font-black font-display text-2xl tracking-tight text-white">Add Repository</DialogTitle></DialogHeader>
                  <div className="space-y-6 pt-6 relative">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Entity / Organization</Label>
                      <Input value={repoForm.owner} onChange={(e) => setRepoForm({ ...repoForm, owner: e.target.value })} placeholder="e.g. monolith-corp" className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all" />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Repository Identifier</Label>
                      <Input value={repoForm.name} onChange={(e) => setRepoForm({ ...repoForm, name: e.target.value })} placeholder="e.g. neural-core" className="bg-white/[0.03] border-white/10 text-white/80 h-11 focus:ring-white/20 transition-all" />
                    </div>
                    <Button onClick={addRepo} className="w-full bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest h-11 mt-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">Register Repository</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {repos.length === 0 ? (
                <p className="text-sm text-white/20 font-light italic text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">No active registries established.</p>
              ) : (
                <div className="space-y-3">
                  {repos.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.01] p-4 group hover:bg-white/[0.03] transition-all duration-300 shadow-lg"
                    >
                      <span className="font-mono text-xs font-bold tracking-tight text-white/60 group-hover:text-white transition-colors">{r.full_name}</span>
                      <div className="flex items-center gap-4">
                        <Badge className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-0", r.is_active ? "bg-white text-black" : "bg-white/5 text-white/40")}>{r.is_active ? "Verified" : "Offline"}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => deleteRepo(r.id)} className="h-8 w-8 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100 transition-all rounded-full">
                          <Trash2 className="h-3.5 w-3.5 opacity-50" />
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
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <CardHeader><CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Tier Allocations</CardTitle></CardHeader>
            <CardContent className="pt-2">
              {subscription ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-[0.15em] text-white/40">Active Protocol Tier</span>
                    <Badge className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 border border-white/5">{planLabels[subscription.plan] ?? subscription.plan}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] uppercase font-black tracking-[0.15em] text-white/40">Neural Capacity Used</span>
                      <span className="font-mono text-sm font-bold text-white/80">{subscription.pr_checks_used} <span className="text-white/20">/ {subscription.pr_checks_limit}</span></span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (subscription.pr_checks_used / subscription.pr_checks_limit) * 100)}%` }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Shimmer className="h-10 w-full opacity-10" />
                  <Shimmer className="h-1.5 w-full opacity-5" />
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
