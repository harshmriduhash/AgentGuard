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

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ display_name: "", organization: "" });
  const [repos, setRepos] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [repoForm, setRepoForm] = useState({ owner: "", name: "" });
  const [repoDialogOpen, setRepoDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data, error }) => {
      if (error) {
        toast({ title: "Failed to load profile", description: error.message, variant: "destructive" });
      }
      if (data) setProfile({ display_name: data.display_name || "", organization: data.organization || "" });
    });
    supabase.from("repositories").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) {
        toast({ title: "Failed to load repositories", description: error.message, variant: "destructive" });
      }
      if (data) setRepos(data);
    });
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single().then(({ data, error }) => {
      if (error) {
        toast({ title: "Failed to load subscription", description: error.message, variant: "destructive" });
      }
      if (data) setSubscription(data);
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      organization: profile.organization,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  const addRepo = async () => {
    if (!user || !repoForm.owner || !repoForm.name) return;
    const { error } = await supabase.from("repositories").insert({
      user_id: user.id,
      owner: repoForm.owner,
      name: repoForm.name,
    });
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
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRepos(repos.filter((r) => r.id !== id));
    }
  };

  const planLabels: Record<string, string> = { free: "Free", starter: "Starter — $29/mo", pro: "Pro — $99/mo" };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, repositories, and subscription</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} />
          </div>
          <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </CardContent>
      </Card>

      {/* Repositories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Connected Repositories</CardTitle>
          <Dialog open={repoDialogOpen} onOpenChange={setRepoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add Repo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Repository</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Owner / Organization</Label>
                  <Input value={repoForm.owner} onChange={(e) => setRepoForm({ ...repoForm, owner: e.target.value })} placeholder="e.g. my-org" />
                </div>
                <div className="space-y-2">
                  <Label>Repository Name</Label>
                  <Input value={repoForm.name} onChange={(e) => setRepoForm({ ...repoForm, name: e.target.value })} placeholder="e.g. my-app" />
                </div>
                <Button onClick={addRepo} className="w-full">Add Repository</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {repos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No repositories connected yet.</p>
          ) : (
            <div className="space-y-2">
              {repos.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="font-mono text-sm">{r.full_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.is_active ? "default" : "outline"}>{r.is_active ? "Active" : "Inactive"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteRepo(r.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Plan:</span>
                <Badge>{planLabels[subscription.plan] ?? subscription.plan}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">PR Checks:</span>
                <span className="font-mono text-sm">{subscription.pr_checks_used} / {subscription.pr_checks_limit}</span>
              </div>
              <div className="h-2 w-full max-w-xs rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (subscription.pr_checks_used / subscription.pr_checks_limit) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading subscription info...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
