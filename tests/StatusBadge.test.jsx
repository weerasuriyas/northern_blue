import { render, screen } from '@testing-library/react'
import StatusBadge from '@/admin/components/StatusBadge'

test('status label text is always visible', () => {
  render(<StatusBadge status="fulfilled" />)
  expect(screen.getByText('fulfilled')).toBeInTheDocument()
})

test('fulfilled orders show green — positive completion signal', () => {
  render(<StatusBadge status="fulfilled" />)
  expect(screen.getByText('fulfilled').className).toContain('green')
})

test('unfulfilled orders show amber — action required', () => {
  render(<StatusBadge status="unfulfilled" />)
  expect(screen.getByText('unfulfilled').className).toContain('amber')
})

test('pending orders show blue — awaiting processing', () => {
  render(<StatusBadge status="pending" />)
  expect(screen.getByText('pending').className).toContain('blue')
})

test('cancelled orders show red — terminal negative state', () => {
  render(<StatusBadge status="cancelled" />)
  expect(screen.getByText('cancelled').className).toContain('red')
})

test('declined returns show red — request denied', () => {
  render(<StatusBadge status="declined" />)
  expect(screen.getByText('declined').className).toContain('red')
})

test('unknown statuses get neutral gray — no false colour signal', () => {
  render(<StatusBadge status="something-unknown" />)
  expect(screen.getByText('something-unknown').className).toContain('gray')
})

test('status matching ignores capitalisation — API inconsistencies handled', () => {
  render(<StatusBadge status="FULFILLED" />)
  expect(screen.getByText('FULFILLED').className).toContain('green')
})

test('missing status does not crash the page', () => {
  render(<StatusBadge />)
  expect(document.querySelector('span').className).toContain('gray')
})
