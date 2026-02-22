import { render, screen } from '@testing-library/react'
import ButterflyLogo from '../components/ButterflyLogo'

test('renders butterfly logo SVG with accessible label', () => {
  render(<ButterflyLogo />)
  expect(screen.getByRole('img', { name: /northern blue butterfly logo/i })).toBeInTheDocument()
})

test('accepts a size prop', () => {
  const { container } = render(<ButterflyLogo size={48} />)
  const svg = container.querySelector('svg')
  expect(svg).toHaveAttribute('width', '48')
})

test('accepts a className prop', () => {
  const { container } = render(<ButterflyLogo className="my-class" />)
  const svg = container.querySelector('svg')
  expect(svg).toHaveClass('my-class')
})

test('applies butterfly-flutter class to SVG when flutter prop is true', () => {
  const { container } = render(<ButterflyLogo flutter />)
  const svg = container.querySelector('svg')
  expect(svg).toHaveClass('butterfly-flutter')
})

test('does not apply butterfly-flutter class by default', () => {
  const { container } = render(<ButterflyLogo />)
  const svg = container.querySelector('svg')
  expect(svg).not.toHaveClass('butterfly-flutter')
})
