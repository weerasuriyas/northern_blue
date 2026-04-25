import 'server-only'
import mysql from 'mysql2/promise'

// Re-use the pool across hot reloads in development
const globalForMysql = globalThis

if (!globalForMysql._mysqlPool) {
  globalForMysql._mysqlPool = mysql.createPool(
    process.env.DATABASE_URL || {
      host:            process.env.MYSQL_HOST     || 'localhost',
      port:    Number(process.env.MYSQL_PORT)     ||  3306,
      user:            process.env.MYSQL_USER     || 'northern_blue',
      password:        process.env.MYSQL_PASSWORD || 'northern_blue',
      database:        process.env.MYSQL_DATABASE || 'northern_blue',
      waitForConnections: true,
      connectionLimit: 10,
      multipleStatements: false,
      // Keep DECIMAL as strings (matches Postgres NUMERIC behaviour and avoids float drift)
      decimalNumbers: false,
    }
  )
}

const pool = globalForMysql._mysqlPool

export default pool

// Convert pg-style $1,$2,... placeholders to mysql2's `?`.
// Each $N must appear exactly once; callers duplicate values for repeated refs.
function toMysqlPlaceholders(text) {
  return text.replace(/\$\d+/g, '?')
}

// Convenience query helper. Returns `{ rows }` so call sites that previously
// used `pg`'s shape (`result.rows`) continue to work unchanged.
export async function query(text, params = []) {
  const sql = toMysqlPlaceholders(text)
  const [rows] = await pool.query(sql, params)
  return { rows }
}
