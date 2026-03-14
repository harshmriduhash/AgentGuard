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
      title: "Add a repository in Settings",
      content: (
        <p className="text-sm text-muted-foreground">
          Go to <span className="font-medium text-foreground">Settings → Connected Repositories</span> and add your GitHub repository. Copy the repository ID.
        </p>
      ),
    },
    {
      num: "2",
      title: "Add GitHub Secrets",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">In your GitHub repo, go to <span className="font-medium text-foreground">Settings → Secrets → Actions</span> and add:</p>
          <div className="space-y-3">
            {[
              { name: "AGENTGUARD_API_URL", desc: "The AgentGuard analyze endpoint URL" },
              { name: "AGENTGUARD_TOKEN", desc: "Your AgentGuard auth token" },
              { name: "AGENTGUARD_REPO_ID", desc: "The repository ID from Step 1" },
            ].map((secret) => (
              <div key={secret.name} className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/30 p-3 hover:border-primary/20 transition-colors">
                <Terminal className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                <div>
                  <code className="text-sm font-semibold text-primary font-mono">{secret.name}</code>
                  <p className="text-xs text-muted-foreground mt-0.5">{secret.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: "3",
      title: "Add the GitHub Action Workflow",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">.github/workflows/agentguard.yml</code>:
          </p>
          <div className="relative">
            <Button variant="ghost" size="sm" className="absolute right-2 top-2 gap-1.5 text-xs z-10" onClick={copyToClipboard}>
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <pre className="overflow-x-auto rounded-lg border border-border/50 bg-background/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {workflowYaml}
            </pre>
          </div>
        </div>
      ),
    },
    {
      num: "4",
      title: "Open a PR and watch it work",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Once committed, every new PR will be analyzed. Results appear in your <span className="font-medium text-foreground">PRs</span> tab.</p>
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-primary">High-risk PRs will fail the check, blocking the merge.</p>
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
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/10 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary font-mono">
                    {step.num}
                  </div>
                  <CardTitle className="text-lg font-display">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>{step.content}</CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </PageTransition>
  );
};

export default GitHubSetupPage;
