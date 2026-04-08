'use client'

import useCart from '@/hooks/useCart'
import { formatCurrency } from '@/lib/formatCurrency'

export default function CartLineItem({ line }) {
  const { updateItem, removeItem } = useCart()
  const { id, quantity, merchandise } = line
  const { title: variantTitle, price, product } = merchandise

  return (
    <div className="flex gap-4 py-4 border-b border-nb-sky/20 last:border-0">
      {/* Image placeholder */}
      <div className="w-16 h-20 rounded-lg bg-nb-sky/20 flex-shrink-0 flex items-center justify-center text-nb-blue/30 text-xs">
        img
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-nb-navy text-sm leading-snug truncate">{product?.title}</p>
        <p className="text-nb-navy/50 text-xs mt-0.5">{variantTitle}</p>
        <p className="text-nb-blue font-medium text-sm mt-1">
          {formatCurrency(price.amount, price.currencyCode)}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateItem(id, quantity - 1)}
            className="w-6 h-6 rounded border border-nb-sky/60 text-nb-navy/60 hover:border-nb-blue hover:text-nb-blue transition-colors flex items-center justify-center text-sm"
            aria-label="decrease quantity"
          >
            −
          </button>
          <span className="text-sm text-nb-navy w-4 text-center">{quantity}</span>
          <button
            onClick={() => updateItem(id, quantity + 1)}
            className="w-6 h-6 rounded border border-nb-sky/60 text-nb-navy/60 hover:border-nb-blue hover:text-nb-blue transition-colors flex items-center justify-center text-sm"
            aria-label="increase quantity"
          >
            +
          </button>
          <button
            onClick={() => removeItem(id)}
            className="ml-2 text-nb-navy/30 hover:text-red-400 transition-colors text-xs"
            aria-label="remove item"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
