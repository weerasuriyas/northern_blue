import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'nb-dev-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'

export function checkCredentials(username, password) {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH) {
    return username === process.env.ADMIN_USERNAME && bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH)
  }
  // Dev fallback only — set ADMIN_USERNAME + ADMIN_PASSWORD_HASH in .env.local for production
  return username === 'admin' && password === 'admin123'
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}
