import { formatCurrency } from '@/lib/formatCurrency'

test('formats a number as CAD by default', () => {
  expect(formatCurrency(10)).toBe('$10.00')
})

test('formats a decimal amount with two decimal places', () => {
  expect(formatCurrency(10.5)).toBe('$10.50')
})

test('formats a string amount (Shopify returns prices as strings)', () => {
  expect(formatCurrency('29.99')).toBe('$29.99')
})

test('formats zero', () => {
  expect(formatCurrency(0)).toBe('$0.00')
})

test('formats a large amount with thousands separator', () => {
  expect(formatCurrency(1234.56)).toBe('$1,234.56')
})

test('respects an explicit currency code', () => {
  const result = formatCurrency(50, 'USD')
  expect(result).toContain('50')
  expect(result).toContain('$')
})
