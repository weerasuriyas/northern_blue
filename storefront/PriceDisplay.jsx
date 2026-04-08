import { formatCurrency } from '@/lib/formatCurrency'

export default function PriceDisplay({ priceRange, className = '' }) {
  const { minVariantPrice } = priceRange
  return (
    <span className={`text-nb-navy font-medium ${className}`}>
      {formatCurrency(minVariantPrice.amount, minVariantPrice.currencyCode)}
    </span>
  )
}
