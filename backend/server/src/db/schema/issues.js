import { pgTable, text, timestamp, uuid, integer, jsonb, numeric, boolean } from 'drizzle-orm/pg-core';
import { scans } from './scans.js';
import { scanFiles } from './scanFiles.js';

export const issues = pgTable('issues', {
  id: uuid('id').defaultRandom().primaryKey(),
  scanId: uuid('scan_id').references(() => scans.id, { onDelete: 'cascade' }).notNull(),
  scanFileId: uuid('scan_file_id').references(() => scanFiles.id, { onDelete: 'set null' }),
  issueKey: text('issue_key'),
  filePath: text('file_path').notNull(),
  line: integer('line'),
  type: text('type').notNull(),
  severity: text('severity').notNull(),
  priority: text('priority').notNull(),
  priorityScore: numeric('priority_score'),
  title: text('title').notNull(),
  description: text('description'),
  explanation: text('explanation'),
  recommendation: text('recommendation'),
  estimatedFixTime: text('estimated_fix_time'),
  codeSnippet: text('code_snippet'),
  aiGenerated: boolean('ai_generated').default(false).notNull(),
  aiMetadata: jsonb('ai_metadata').default({}).notNull(),
  metrics: jsonb('metrics').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
