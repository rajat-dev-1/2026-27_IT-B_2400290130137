import { pgTable, text, timestamp, uuid, integer, jsonb, numeric, unique } from 'drizzle-orm/pg-core';
import { scans } from './scans.js';

export const scanFiles = pgTable('scan_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  scanId: uuid('scan_id').references(() => scans.id, { onDelete: 'cascade' }).notNull(),
  path: text('path').notNull(),
  language: text('language'),
  lines: integer('lines').default(0).notNull(),
  functions: integer('functions').default(0).notNull(),
  classes: integer('classes').default(0).notNull(),
  complexity: integer('complexity').default(0).notNull(),
  duplication: numeric('duplication').default('0').notNull(),
  healthScore: numeric('health_score'),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqScanPath: unique().on(t.scanId, t.path)
}));
