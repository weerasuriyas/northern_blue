import { checkCredentials, signToken, verifyToken } from '@/lib/auth'

describe('checkCredentials — admin login gate', () => {
  test('wrong password blocks login', () => {
    expect(checkCredentials('admin', 'wrong-password')).toBe(false)
  })

  test('wrong username blocks login', () => {
    expect(checkCredentials('unknown-user', 'any-password')).toBe(false)
  })

  test('empty credentials are blocked', () => {
    expect(checkCredentials('', '')).toBe(false)
  })
})

describe('signToken / verifyToken — session integrity', () => {
  test('signing produces a valid three-part JWT', () => {
    const token = signToken({ username: 'admin' })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  test('signed payload survives a round-trip', () => {
    const payload = { username: 'admin', role: 'admin' }
    const decoded = verifyToken(signToken(payload))
    expect(decoded).toMatchObject(payload)
  })

  test('malformed token is rejected — no access granted', () => {
    expect(verifyToken('not.a.jwt')).toBeNull()
  })

  test('tampered token is rejected — signature mismatch detected', () => {
    const token = signToken({ username: 'admin' })
    expect(verifyToken(token.slice(0, -4) + 'xxxx')).toBeNull()
  })

  test('empty string returns null — no silent access', () => {
    expect(verifyToken('')).toBeNull()
  })
})
