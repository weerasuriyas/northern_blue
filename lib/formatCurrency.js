export function formatCurrency(amount, currencyCode = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}
