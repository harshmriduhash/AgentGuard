import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">GitHub Integration</h1>
        <p className="text-sm text-muted-foreground">Set up AgentGuard to automatically analyze PRs in your repositories</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-bold">1</Badge>
            <CardTitle className="text-lg">Add a repository in Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Go to <span className="font-medium text-foreground">Settings → Connected Repositories</span> and add your GitHub repository. Copy the repository ID — you'll need it for the GitHub Action secret.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-bold">2</Badge>
            <CardTitle className="text-lg">Add GitHub Secrets</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In your GitHub repo, go to <span className="font-medium text-foreground">Settings → Secrets and variables → Actions</span> and add:
          </p>
          <div className="space-y-3">
            {[
              { name: "AGENTGUARD_API_URL", desc: "The AgentGuard analyze endpoint URL" },
              { name: "AGENTGUARD_TOKEN", desc: "Your AgentGuard auth token (from your session)" },
              { name: "AGENTGUARD_REPO_ID", desc: "The repository ID from Step 1" },
            ].map((secret) => (
              <div key={secret.name} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                <Terminal className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                <div>
                  <code className="text-sm font-semibold text-primary">{secret.name}</code>
                  <p className="text-xs text-muted-foreground mt-0.5">{secret.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-bold">3</Badge>
            <CardTitle className="text-lg">Add the GitHub Action Workflow</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a file at <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.github/workflows/agentguard.yml</code> in your repository:
          </p>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 gap-1.5 text-xs"
              onClick={copyToClipboard}
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {workflowYaml}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-bold">4</Badge>
            <CardTitle className="text-lg">Open a PR and watch it work</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Once the workflow is committed, every new PR will be automatically analyzed. Results appear in your dashboard under the <span className="font-medium text-foreground">PRs</span> tab.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-primary">High-risk PRs will fail the GitHub Action check, blocking the merge until reviewed.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubSetupPage;
