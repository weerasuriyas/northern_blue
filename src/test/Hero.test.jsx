import { render, screen } from '@testing-library/react'
import Hero from '../components/Hero'

test('renders the brand name heading', () => {
  render(<Hero />)
  expect(screen.getByRole('heading', { name: /northern blue/i })).toBeInTheDocument()
})

test('renders the tagline', () => {
  render(<Hero />)
  expect(screen.getByText(/style for every body/i)).toBeInTheDocument()
})

test('renders scroll-down link pointing to about section', () => {
  render(<Hero />)
  expect(screen.getByRole('link', { name: /scroll down/i })).toHaveAttribute('href', '#about')
})

test('hero butterfly logo has flutter animation enabled', () => {
  const { container } = render(<Hero />)
  const svg = container.querySelector('svg')
  expect(svg).toHaveClass('butterfly-flutter')
})
