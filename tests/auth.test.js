import { checkCredentials, signToken, verifyToken } from '@/lib/auth'

// checkCredentials uses the dev fallback (admin/admin123) when env vars are unset
describe('checkCredentials', () => {
  test('accepts the dev fallback credentials', () => {
    expect(checkCredentials('admin', 'admin123')).toBe(true)
  })

  test('rejects wrong password', () => {
    expect(checkCredentials('admin', 'wrong')).toBe(false)
  })

  test('rejects wrong username', () => {
    expect(checkCredentials('notadmin', 'admin123')).toBe(false)
  })

  test('rejects empty credentials', () => {
    expect(checkCredentials('', '')).toBe(false)
  })
})

describe('signToken / verifyToken round-trip', () => {
  test('signToken returns a string', () => {
    const token = signToken({ username: 'admin' })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // header.payload.signature
  })

  test('verifyToken decodes a signed payload', () => {
    const payload = { username: 'admin', role: 'admin' }
    const token = signToken(payload)
    const decoded = verifyToken(token)
    expect(decoded).toMatchObject(payload)
  })

  test('verifyToken returns null for a malformed token', () => {
    expect(verifyToken('not.a.jwt')).toBeNull()
  })

  test('verifyToken returns null for a tampered token', () => {
    const token = signToken({ username: 'admin' })
    const tampered = token.slice(0, -4) + 'xxxx'
    expect(verifyToken(tampered)).toBeNull()
  })

  test('verifyToken returns null for an empty string', () => {
    expect(verifyToken('')).toBeNull()
  })
})
