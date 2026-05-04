import { render, screen } from '@testing-library/react'
import PriceDisplay from '@/storefront/PriceDisplay'

const priceRange = (amount, currencyCode = 'CAD') => ({
  minVariantPrice: { amount, currencyCode },
})

test('product price renders from the Shopify priceRange shape', () => {
  render(<PriceDisplay priceRange={priceRange('29.99')} />)
  expect(screen.getByText('$29.99')).toBeInTheDocument()
})

test('free products show $0.00 — not a blank price field', () => {
  render(<PriceDisplay priceRange={priceRange('0.00')} />)
  expect(screen.getByText('$0.00')).toBeInTheDocument()
})

test('additional classNames apply correctly for layout contexts', () => {
  const { container } = render(
    <PriceDisplay priceRange={priceRange('10.00')} className="text-xl" />
  )
  expect(container.firstChild.className).toContain('text-xl')
})

test('Shopify string amounts (not numbers) render without conversion errors', () => {
  render(<PriceDisplay priceRange={priceRange('149.00', 'CAD')} />)
  expect(screen.getByText('$149.00')).toBeInTheDocument()
})
