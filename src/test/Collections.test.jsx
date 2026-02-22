import { render, screen } from '@testing-library/react'
import Collections from '../components/Collections'

test('renders Our Collections heading', () => {
  render(<Collections />)
  expect(screen.getByRole('heading', { name: /our collections/i })).toBeInTheDocument()
})

test('renders all 4 collection cards', () => {
  render(<Collections />)
  expect(screen.getByText('Spring Collection')).toBeInTheDocument()
  expect(screen.getByText('Everyday Essentials')).toBeInTheDocument()
  expect(screen.getByText('Workwear Edit')).toBeInTheDocument()
  expect(screen.getByText('Weekend Casual')).toBeInTheDocument()
})

test('renders 4 Explore buttons', () => {
  render(<Collections />)
  expect(screen.getAllByRole('button', { name: /explore/i })).toHaveLength(4)
})

test('has correct section id for smooth scroll', () => {
  const { container } = render(<Collections />)
  expect(container.querySelector('#collections')).toBeInTheDocument()
})
