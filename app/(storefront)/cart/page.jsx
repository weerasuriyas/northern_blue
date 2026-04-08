'use client'

import Link from 'next/link'
import useCart from '@/hooks/useCart'
import CartLineItem from '@/storefront/CartLineItem'
import CartSummary from '@/storefront/CartSummary'

export default function CartPage() {
  const { cart } = useCart()

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      <h1 className="font-serif text-3xl text-nb-navy mb-8">Your Cart</h1>

      {cart.lines.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-nb-navy/50">Your cart is empty.</p>
          <Link
            href="/collections"
            className="inline-block bg-nb-blue text-white font-medium px-6 py-3 rounded-lg hover:bg-nb-navy transition-colors text-sm"
          >
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {cart.lines.map(line => (
            <CartLineItem key={line.id} line={line} />
          ))}
          <div className="pt-6">
            <CartSummary cart={cart} />
          </div>
        </div>
      )}
    </div>
  )
}
