import { NextResponse } from 'next/server'
import { checkCredentials, signToken } from '@/lib/auth'

export async function POST(request) {
  const { username, password } = await request.json()

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken({ username, role: 'admin' })
  const response = NextResponse.json({ ok: true })

  response.cookies.set('nb-admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
