import pg from 'pg';
const { Client } = pg;
import { env } from './src/config/env.js';

const client = new Client({
  connectionString: env.DATABASE_URL
});

async function run() {
  await client.connect();
  const repoRes = await client.query(`SELECT id, last_scan_id, last_scanned_at FROM repositories WHERE full_name = 'rajat-dev-1/Spiral-Infra'`);
  if (repoRes.rows.length === 0) {
    console.log("No repo found");
    return client.end();
  }
  console.log("=== REPO ===");
  console.log(repoRes.rows[0]);
  
  await client.end();
}

run().catch(console.error);
