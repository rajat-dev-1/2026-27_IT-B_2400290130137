import { pgTable, text, timestamp, uuid, integer, jsonb, numeric, check, unique, index, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repositories.js';
import { users } from './users.js';

export const scans = pgTable('scans', {
  id: uuid('id').defaultRandom().primaryKey(),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  commitSha: text('commit_sha').notNull(),
  runNumber: integer('run_number').default(1).notNull(),
  isRescan: boolean('is_rescan').default(false).notNull(),
  jobId: text('job_id'),
  status: text('status').default('queued').notNull(),
  attemptCount: integer('attempt_count').default(0).notNull(),
  progress: integer('progress').default(0).notNull(),
  progressMessage: text('progress_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationMs: integer('duration_ms'),
  errorLog: jsonb('error_log').default([]).notNull(),
  warnings: jsonb('warnings').default([]).notNull(),
  metrics: jsonb('metrics').default({}).notNull(),
  languages: jsonb('languages').default({}).notNull(),
  overallScore: numeric('overall_score'),
  complexityScore: numeric('complexity_score'),
  duplicationScore: numeric('duplication_score'),
  deadCodeScore: numeric('dead_code_score'),
  dependencyScore: numeric('dependency_score'),
  architectureScore: numeric('architecture_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  repoCommitRunUnique: unique('scans_repo_commit_run_unique').on(table.repositoryId, table.commitSha, table.runNumber),
  statusCheck: check('status_check', sql`${table.status} IN ('queued', 'running', 'completed', 'failed')`),
  progressCheck: check('progress_check', sql`${table.progress} >= 0 AND ${table.progress} <= 100`),
  repoCompletedIdx: index('repo_completed_idx').on(table.repositoryId, table.completedAt.desc()),
  userStatusCreatedIdx: index('user_status_created_idx').on(table.userId, table.status, table.createdAt.desc())
}));
