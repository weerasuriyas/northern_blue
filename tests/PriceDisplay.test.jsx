import { render, screen } from '@testing-library/react'
import PriceDisplay from '@/storefront/PriceDisplay'

const priceRange = (amount, currencyCode = 'CAD') => ({
  minVariantPrice: { amount, currencyCode },
})

test('renders a formatted price', () => {
  render(<PriceDisplay priceRange={priceRange('29.99')} />)
  expect(screen.getByText('$29.99')).toBeInTheDocument()
})

test('formats zero price', () => {
  render(<PriceDisplay priceRange={priceRange('0.00')} />)
  expect(screen.getByText('$0.00')).toBeInTheDocument()
})

test('applies an additional className', () => {
  const { container } = render(
    <PriceDisplay priceRange={priceRange('10.00')} className="text-xl" />
  )
  expect(container.firstChild.className).toContain('text-xl')
})

test('formats a string amount from the Shopify API shape', () => {
  render(<PriceDisplay priceRange={priceRange('149.00', 'CAD')} />)
  expect(screen.getByText('$149.00')).toBeInTheDocument()
})
