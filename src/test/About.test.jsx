import { render, screen } from '@testing-library/react'
import About from '../components/About'

test('renders Our Story heading', () => {
  render(<About />)
  expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument()
})

test('has correct anchor id for smooth scroll', () => {
  const { container } = render(<About />)
  expect(container.querySelector('#about')).toBeInTheDocument()
})

test('renders the pull-quote', () => {
  render(<About />)
  expect(screen.getByText(/every woman deserves/i)).toBeInTheDocument()
})

test('image and text columns have fade-in class', () => {
  const { container } = render(<About />)
  const fadeEls = container.querySelectorAll('.fade-in')
  expect(fadeEls.length).toBeGreaterThanOrEqual(2)
})
