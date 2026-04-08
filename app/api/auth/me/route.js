import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('nb-admin-token')?.value

  if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  return NextResponse.json({ username: payload.username, role: payload.role })
}
