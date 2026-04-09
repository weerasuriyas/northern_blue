import pg from 'pg'

const { Pool } = pg

// Re-use the pool across hot reloads in development
const globalForPg = globalThis

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  })
}

const pool = globalForPg._pgPool

export default pool

// Convenience query helper
export function query(text, params) {
  return pool.query(text, params)
}
