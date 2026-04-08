import { render, screen } from '@testing-library/react'
import Collections from '@/components/Collections'

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

test('renders 4 Explore links', () => {
  render(<Collections />)
  expect(screen.getAllByRole('link', { name: /explore/i })).toHaveLength(4)
})

test('Explore links point to collection pages', () => {
  render(<Collections />)
  const links = screen.getAllByRole('link', { name: /explore/i })
  expect(links[0]).toHaveAttribute('href', '/collections/spring-collection')
})

test('has correct section id for smooth scroll', () => {
  const { container } = render(<Collections />)
  expect(container.querySelector('#collections')).toBeInTheDocument()
})

test('heading and grid have fade-in class', () => {
  const { container } = render(<Collections />)
  const fadeEls = container.querySelectorAll('.fade-in')
  expect(fadeEls.length).toBeGreaterThanOrEqual(2)
})
