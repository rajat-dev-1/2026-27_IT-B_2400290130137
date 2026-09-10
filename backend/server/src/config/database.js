import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from './env.js';
import * as schema from '../db/schema/index.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Use pooled database URL for runtime
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

pool.on('connect', () => {
  logger.info({ event: 'database.connected' }, 'Database connection established');
});

pool.on('error', (err) => {
  logger.error({ err, event: 'database.error' }, 'Unexpected error on idle database client');
});

export const closeDatabase = async () => {
  logger.info({ event: 'database.disconnecting' }, 'Closing database connection pool');
  await pool.end();
  logger.info({ event: 'database.disconnected' }, 'Database connection pool closed');
};
