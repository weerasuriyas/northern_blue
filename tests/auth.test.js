import { checkCredentials, signToken, verifyToken } from '@/lib/auth'

// Dev fallback credentials — only active when ADMIN_USERNAME + ADMIN_PASSWORD_HASH
// env vars are not set. Override both in .env.local before production.
const DEV_USER = process.env.ADMIN_USERNAME     || 'admin'
const DEV_PASS = process.env.ADMIN_PASSWORD_RAW || 'admin123' // plain-text dev default only

describe('checkCredentials — admin login gate', () => {
  test('correct credentials grant admin access', () => {
    expect(checkCredentials(DEV_USER, DEV_PASS)).toBe(true)
  })

  test('wrong password blocks login', () => {
    expect(checkCredentials(DEV_USER, DEV_PASS + '_wrong')).toBe(false)
  })

  test('wrong username blocks login', () => {
    expect(checkCredentials('not_' + DEV_USER, DEV_PASS)).toBe(false)
  })

  test('empty credentials are blocked', () => {
    expect(checkCredentials('', '')).toBe(false)
  })
})

describe('signToken / verifyToken — session integrity', () => {
  test('signing produces a valid three-part JWT', () => {
    const token = signToken({ username: DEV_USER })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  test('signed payload survives a round-trip', () => {
    const payload = { username: DEV_USER, role: 'admin' }
    const decoded = verifyToken(signToken(payload))
    expect(decoded).toMatchObject(payload)
  })

  test('malformed token is rejected — no access granted', () => {
    expect(verifyToken('not.a.jwt')).toBeNull()
  })

  test('tampered token is rejected — signature mismatch detected', () => {
    const token = signToken({ username: DEV_USER })
    expect(verifyToken(token.slice(0, -4) + 'xxxx')).toBeNull()
  })

  test('empty string returns null — no silent access', () => {
    expect(verifyToken('')).toBeNull()
  })
})
