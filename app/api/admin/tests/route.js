import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { spawn } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const OUTPUT_FILE = join(process.cwd(), '.vitest-results.json')

function normalizeVitestResult(raw, extra = {}) {
  const testResults = Array.isArray(raw?.testResults) ? raw.testResults : []
  const countedTests = testResults.reduce(
    (total, suite) => total + (Array.isArray(suite.assertionResults) ? suite.assertionResults.length : 0),
    0
  )

  return {
    ...raw,
    numTotalTests: raw?.numTotalTests ?? countedTests,
    numPassedTests: raw?.numPassedTests ?? 0,
    numFailedTests: raw?.numFailedTests ?? 0,
    numTotalTestFiles: testResults.length,
    testResults,
    ...extra,
  }
}

function readStoredResult() {
  const raw = JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'))
  return normalizeVitestResult(raw)
}

async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('nb-admin-token')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// Module-level cache — survives across requests in a single server process
const state = { running: false, result: null }

// Hydrate from the output file on first cold import (e.g. after a server restart)
if (existsSync(OUTPUT_FILE)) {
  try {
    state.result = readStoredResult()
  } catch { /* ignore corrupt file */ }
}

export async function GET() {
  return NextResponse.json({ running: state.running, result: state.result })
}

export async function POST() {
  const authErr = await requireAuth()
  if (authErr) return authErr

  if (state.running) {
    return NextResponse.json({ error: 'Tests already running' }, { status: 409 })
  }

  state.running = true

  return new Promise(resolve => {
    const proc = spawn(
      process.execPath,
      [
        'node_modules/.bin/vitest',
        'run',
        '--reporter=json',
        `--outputFile=${OUTPUT_FILE}`,
      ],
      { cwd: process.cwd(), env: process.env }
    )

    let stderr = ''
    proc.stderr.on('data', chunk => { stderr += chunk })

    proc.on('close', code => {
      state.running = false
      try {
        state.result = normalizeVitestResult(readStoredResult(), {
          exitCode: code,
          ranAt: new Date().toISOString(),
        })
      } catch {
        state.result = {
          error: 'Could not parse test output',
          stderr: stderr.slice(0, 2000),
          exitCode: code,
          ranAt: new Date().toISOString(),
        }
      }
      resolve(NextResponse.json({ running: false, result: state.result }))
    })

    proc.on('error', err => {
      state.running = false
      state.result = { error: err.message, exitCode: 1, ranAt: new Date().toISOString() }
      resolve(NextResponse.json({ running: false, result: state.result }))
    })
  })
}
