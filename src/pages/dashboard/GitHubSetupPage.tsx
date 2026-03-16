import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";

const workflowYaml = `name: AgentGuard PR Analysis
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  agentguard-analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        id: diff
        run: |
          git diff origin/\$\{{ github.base_ref }}...HEAD > pr_diff.txt
          echo "diff<<EOF" >> \$GITHUB_OUTPUT
          head -c 30000 pr_diff.txt >> \$GITHUB_OUTPUT
          echo "EOF" >> \$GITHUB_OUTPUT

      - name: Run AgentGuard Analysis
        env:
          AGENTGUARD_API_URL: \$\{{ secrets.AGENTGUARD_API_URL }}
          AGENTGUARD_TOKEN: \$\{{ secrets.AGENTGUARD_TOKEN }}
          AGENTGUARD_REPO_ID: \$\{{ secrets.AGENTGUARD_REPO_ID }}
        run: |
          RESPONSE=\$(curl -s -X POST "\$AGENTGUARD_API_URL" \\\\
            -H "Authorization: Bearer \$AGENTGUARD_TOKEN" \\\\
            -H "Content-Type: application/json" \\\\
            -d '{
              "repository_id": "'\\"\\$AGENTGUARD_REPO_ID\\"'",
              "pr_number": '\$\{{ github.event.pull_request.number }}',
              "title": "'\$\{{ github.event.pull_request.title }}'",
              "diff": '\$\{{ toJSON(steps.diff.outputs.diff) }}',
              "agent_name": "'\$\{{ github.event.pull_request.user.login }}'"
            }')
          echo "\$RESPONSE" | jq .
          STATUS=\$(echo "\$RESPONSE" | jq -r '.status')
          if [ "\$STATUS" = "blocked" ]; then
            echo "::error::PR blocked by AgentGuard (risk too high)"
            exit 1
          fi`;

const GitHubSetupPage = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(workflowYaml);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const stepsData = [
    {
      num: "1",
      title: "Establish Registry Entity",
      content: (
        <p className="text-xs text-white/40 leading-relaxed">
          Navigate to <span className="font-bold text-white/80">Settings → Registry Protocols</span> and register your repository. Secure the unique identifier for baseline initialization.
        </p>
      ),
    },
    {
      num: "2",
      title: "Inject Cipher Secrets",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-white/40 leading-relaxed">In your GitHub environment, deploy the following secrets within <span className="font-bold text-white/80">Settings → Secrets → Actions</span>:</p>
          <div className="grid gap-3">
            {[
              { name: "AGENTGUARD_API_URL", desc: "Monolith endpoint for neural analysis" },
              { name: "AGENTGUARD_TOKEN", desc: "Encrypted authorization credential" },
              { name: "AGENTGUARD_REPO_ID", desc: "Unique repository signature" },
            ].map((secret) => (
              <div key={secret.name} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 group/secret hover:bg-white/[0.04] transition-all">
                <Terminal className="h-4 w-4 text-white/20 group-hover/secret:text-white transition-colors shrink-0" />
                <div>
                  <code className="text-xs font-black text-white/80 font-mono tracking-tighter uppercase">{secret.name}</code>
                  <p className="text-[10px] text-white/30 group-hover/secret:text-white/50 transition-colors mt-0.5">{secret.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: "3",
      title: "Deploy Workflow Protocol",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-white/40 leading-relaxed">
            Initialize <code className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono border border-white/5 text-white/60">.github/workflows/agentguard.yml</code>:
          </p>
          <div className="relative group/code">
            <Button variant="ghost" size="sm" className="absolute right-3 top-3 gap-2 text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-white/20 text-white/40 hover:text-white transition-all rounded-lg z-10" onClick={copyToClipboard}>
              {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy Cipher"}
            </Button>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-5 font-mono text-[10px] leading-relaxed text-white/40 group-hover/code:text-white/60 transition-colors custom-scrollbar max-h-[400px]">
              {workflowYaml}
            </pre>
          </div>
        </div>
      ),
    },
    {
      num: "4",
      title: "Initiate Synchronization",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-white/40 leading-relaxed">Commence a Pull Request to trigger the neural analysis loop. Real-time logging is accessible via the <span className="font-bold text-white/80">PRs</span> interface.</p>
          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-inner">
            <CheckCircle className="h-5 w-5 text-white/60 shrink-0" />
            <p className="text-xs text-white font-bold tracking-tight">Anomalous high-risk entities will be automatically quarantined, neutralizing the merge protocol.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6 max-w-3xl">
        <StaggerItem>
          <h1 className="text-2xl font-bold font-display">GitHub Integration</h1>
          <p className="text-sm text-muted-foreground">Set up AgentGuard to automatically analyze PRs</p>
        </StaggerItem>

        {stepsData.map((step) => (
          <StaggerItem key={step.num}>
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden relative group hover:bg-white/[0.02] transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black text-xs font-black font-mono shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {step.num}
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight text-white/90 group-hover:text-white transition-colors">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative">{step.content}</CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </PageTransition>
  );
};

export default GitHubSetupPage;
