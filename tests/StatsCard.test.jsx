import { render, screen } from '@testing-library/react'
import StatsCard from '@/admin/components/StatsCard'

test('metric title and value are always visible on the dashboard', () => {
  render(<StatsCard title="Total Orders" value="42" />)
  expect(screen.getByText('Total Orders')).toBeInTheDocument()
  expect(screen.getByText('42')).toBeInTheDocument()
})

test('supporting context line shows when provided', () => {
  render(<StatsCard title="Revenue" value="$1,200" sub="this month" />)
  expect(screen.getByText('this month')).toBeInTheDocument()
})

test('no extra elements rendered when sub-text is absent', () => {
  render(<StatsCard title="Customers" value="10" />)
  // Only title and value paragraphs — no phantom element
  expect(document.querySelectorAll('p')).toHaveLength(2)
})

test('numeric values render as readable text', () => {
  render(<StatsCard title="Items" value={99} />)
  expect(screen.getByText('99')).toBeInTheDocument()
})
