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
