-- Helper function for atomic agent stats updates
CREATE OR REPLACE FUNCTION public.increment_agent_stats(
  p_agent_id UUID,
  p_violations_delta INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.agents
  SET
    total_prs = total_prs + 1,
    violations_count = violations_count + COALESCE(p_violations_delta, 0),
    updated_at = now()
  WHERE id = p_agent_id;
END;
$$;

-- Helper function for atomic subscription usage increment
CREATE OR REPLACE FUNCTION public.increment_subscription_usage(
  p_subscription_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.subscriptions
  SET
    pr_checks_used = pr_checks_used + 1,
    updated_at = now()
  WHERE id = p_subscription_id;
END;
$$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON public.repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON public.rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_repository_id ON public.rules(repository_id);
CREATE INDEX IF NOT EXISTS idx_pr_analyses_user_id_created_at ON public.pr_analyses(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pr_analyses_repository_id ON public.pr_analyses(repository_id);
CREATE INDEX IF NOT EXISTS idx_rule_violations_pr_analysis_id ON public.rule_violations(pr_analysis_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

