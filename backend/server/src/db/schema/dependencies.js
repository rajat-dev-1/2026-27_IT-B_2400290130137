import { pgTable, text, timestamp, uuid, boolean, jsonb, unique } from 'drizzle-orm/pg-core';
import { scans } from './scans.js';

export const dependencies = pgTable('dependencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  scanId: uuid('scan_id').references(() => scans.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  installedVersion: text('installed_version'),
  latestVersion: text('latest_version'),
  isOutdated: boolean('is_outdated').default(false).notNull(),
  hasVulnerabilities: boolean('has_vulnerabilities').default(false).notNull(),
  vulnerabilities: jsonb('vulnerabilities').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqScanName: unique().on(t.scanId, t.name)
}));
