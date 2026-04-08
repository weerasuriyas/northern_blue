import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'nb-dev-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'

// Hardcoded test credentials — swap for env + bcrypt in production
const TEST_USERNAME = 'admin'
const TEST_PASSWORD = 'admin123'

export function checkCredentials(username, password) {
  return username === TEST_USERNAME && password === TEST_PASSWORD
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
