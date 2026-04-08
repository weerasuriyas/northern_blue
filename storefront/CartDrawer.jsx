'use client'

import useCart from '@/hooks/useCart'
import CartLineItem from './CartLineItem'
import CartSummary from './CartSummary'

export default function CartDrawer() {
  const { cart, isOpen, closeCart, itemCount } = useCart()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-nb-navy/20 backdrop-blur-sm z-40"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-nb-sky/20">
          <h2 className="font-serif text-lg text-nb-navy">
            Your Cart {itemCount > 0 && <span className="text-nb-blue text-sm">({itemCount})</span>}
          </h2>
          <button
            onClick={closeCart}
            aria-label="close cart"
            className="text-nb-navy/40 hover:text-nb-navy transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {cart.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-nb-sky">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-nb-navy/50 text-sm">Your cart is empty.</p>
              <a href="/collections" className="text-nb-blue text-sm underline underline-offset-2">
                Browse collections
              </a>
            </div>
          ) : (
            cart.lines.map(line => <CartLineItem key={line.id} line={line} />)
          )}
        </div>

        {/* Footer */}
        {cart.lines.length > 0 && (
          <div className="px-5 pb-6 pt-2">
            <CartSummary cart={cart} />
          </div>
        )}
      </div>
    </>
  )
}
