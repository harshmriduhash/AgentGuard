import { pgTable, serial, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // Clerk user ID
  displayName: text('display_name'),
  organization: text('organization'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => profiles.id),
  role: text('role').notNull(), // 'admin' | 'user'
});

export const repositories = pgTable('repositories', {
  id: serial('id').primaryKey(),
  owner: text('owner').notNull(),
  name: text('name').notNull(),
  installStatus: text('install_status').default('pending'),
  userId: text('user_id').references(() => profiles.id),
});

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  trustScore: integer('trust_score').default(0),
  totalPrs: integer('total_prs').default(0),
  violationsCount: integer('violations_count').default(0),
  approvalsCount: integer('approvals_count').default(0),
  userId: text('user_id').references(() => profiles.id),
});

export const rules = pgTable('rules', {
  id: serial('id').primaryKey(),
  repoId: integer('repo_id').references(() => repositories.id),
  type: text('type').notNull(),
  pattern: text('pattern').notNull(),
  description: text('description'),
  active: boolean('active').default(true),
});

export const prAnalyses = pgTable('pr_analyses', {
  id: serial('id').primaryKey(),
  repoId: integer('repo_id').references(() => repositories.id),
  prNumber: integer('pr_number').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  riskScore: integer('risk_score').default(0),
  status: text('status').default('pass'), // 'pass' | 'needs review' | 'blocked'
  createdAt: timestamp('created_at').defaultNow(),
});

export const ruleViolations = pgTable('rule_violations', {
  id: serial('id').primaryKey(),
  ruleId: integer('rule_id').references(() => rules.id),
  prAnalysisId: integer('pr_analysis_id').references(() => prAnalyses.id),
  details: text('details'),
});

export const agentActivity = pgTable('agent_activity', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id),
  prAnalysisId: integer('pr_analysis_id').references(() => prAnalyses.id),
  actionType: text('action_type').notNull(),
  scoreDelta: integer('score_delta'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => profiles.id),
  planTier: text('plan_tier').default('free'),
  prChecksLimit: integer('pr_checks_limit'),
  prChecksUsed: integer('pr_checks_used').default(0),
});
