import { pgTable, text, timestamp, uuid, bigint, boolean, numeric, jsonb, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const repositories = pgTable('repositories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  githubRepoId: bigint('github_repo_id', { mode: 'number' }).notNull(),
  owner: text('owner').notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  defaultBranch: text('default_branch'),
  primaryLanguage: text('primary_language'),
  description: text('description'),
  isPrivate: boolean('is_private').default(false).notNull(),
  currentHealthScore: numeric('current_health_score'),
  lastScanId: uuid('last_scan_id'), // nullable, avoid circular FK
  lastScannedAt: timestamp('last_scanned_at', { withTimezone: true }),
  settings: jsonb('settings').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.githubRepoId),
}));
