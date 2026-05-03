import { render, screen } from '@testing-library/react'
import StatusBadge from '@/admin/components/StatusBadge'

test('renders the status text', () => {
  render(<StatusBadge status="fulfilled" />)
  expect(screen.getByText('fulfilled')).toBeInTheDocument()
})

test('applies green styles for fulfilled', () => {
  render(<StatusBadge status="fulfilled" />)
  expect(screen.getByText('fulfilled').className).toContain('green')
})

test('applies amber styles for unfulfilled', () => {
  render(<StatusBadge status="unfulfilled" />)
  expect(screen.getByText('unfulfilled').className).toContain('amber')
})

test('applies blue styles for pending', () => {
  render(<StatusBadge status="pending" />)
  expect(screen.getByText('pending').className).toContain('blue')
})

test('applies red styles for cancelled', () => {
  render(<StatusBadge status="cancelled" />)
  expect(screen.getByText('cancelled').className).toContain('red')
})

test('applies red styles for declined', () => {
  render(<StatusBadge status="declined" />)
  expect(screen.getByText('declined').className).toContain('red')
})

test('falls back to gray for unknown statuses', () => {
  render(<StatusBadge status="something-unknown" />)
  const badge = screen.getByText('something-unknown')
  expect(badge.className).toContain('gray')
})

test('is case-insensitive via toLowerCase()', () => {
  render(<StatusBadge status="FULFILLED" />)
  expect(screen.getByText('FULFILLED').className).toContain('green')
})

test('handles undefined status without crashing', () => {
  render(<StatusBadge />)
  // should render with fallback gray styles, no crash
  const badge = document.querySelector('span')
  expect(badge.className).toContain('gray')
})
