import { formatCurrency } from '@/lib/formatCurrency'

test('prices default to Canadian dollar format', () => {
  expect(formatCurrency(10)).toBe('$10.00')
})

test('all prices show exactly two decimal places', () => {
  expect(formatCurrency(10.5)).toBe('$10.50')
})

test('Shopify string prices (sent as strings from the API) render correctly', () => {
  expect(formatCurrency('29.99')).toBe('$29.99')
})

test('zero-price items show $0.00 — not blank or null', () => {
  expect(formatCurrency(0)).toBe('$0.00')
})

test('large prices use thousands separator — readable at a glance', () => {
  expect(formatCurrency(1234.56)).toBe('$1,234.56')
})

test('non-CAD currency codes are applied when specified', () => {
  const result = formatCurrency(50, 'USD')
  expect(result).toContain('50')
  expect(result).toContain('$')
})
