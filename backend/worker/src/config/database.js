import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../../../server/src/config/env.js';
import * as schema from '../../../server/src/db/schema/index.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

pool.on('connect', () => {
  logger.info({ event: 'database.connected' }, 'Database connection established (Worker)');
});

pool.on('error', (err) => {
  logger.error({ err, event: 'database.error' }, 'Unexpected error on idle database client (Worker)');
});

export async function connectDatabase() {
  await pool.query('SELECT 1');
}

export const closeDatabase = async () => {
  logger.info({ event: 'database.disconnecting' }, 'Closing database connection pool (Worker)');
  await pool.end();
  logger.info({ event: 'database.disconnected' }, 'Database connection pool closed (Worker)');
};
