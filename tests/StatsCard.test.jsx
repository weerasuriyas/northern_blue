import { render, screen } from '@testing-library/react'
import StatsCard from '@/admin/components/StatsCard'

test('renders the title and value', () => {
  render(<StatsCard title="Total Orders" value="42" />)
  expect(screen.getByText('Total Orders')).toBeInTheDocument()
  expect(screen.getByText('42')).toBeInTheDocument()
})

test('renders the sub text when provided', () => {
  render(<StatsCard title="Revenue" value="$1,200" sub="this month" />)
  expect(screen.getByText('this month')).toBeInTheDocument()
})

test('does not render sub text when omitted', () => {
  render(<StatsCard title="Customers" value="10" />)
  // No sub element should be present — only title and value paragraphs
  const paragraphs = document.querySelectorAll('p')
  expect(paragraphs).toHaveLength(2)
})

test('renders numeric value as a string', () => {
  render(<StatsCard title="Items" value={99} />)
  expect(screen.getByText('99')).toBeInTheDocument()
})
