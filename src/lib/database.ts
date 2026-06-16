import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/storage/database/shared/schema';

const pool = new Pool({
  connectionString: process.env.PGDATABASE_URL,
});

export const db = drizzle(pool, { schema });

export async function closeDb() {
  await pool.end();
}