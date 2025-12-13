// Database connection for Postgres using node-postgres (pg)
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Helper function to test connection
export async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW() as now');
        console.log('✓ Postgres connected successfully', result.rows[0]);
        return true;
    } catch (error) {
        console.error('✗ Postgres connection failed:', error);
        return false;
    }
}
