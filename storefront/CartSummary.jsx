import { formatCurrency } from '@/lib/formatCurrency'

export default function CartSummary({ cart }) {
  const { cost, checkoutUrl } = cart
  const subtotal = cost?.subtotalAmount

  return (
    <div className="border-t border-nb-sky/20 pt-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-nb-navy/60">Subtotal</span>
        <span className="font-medium text-nb-navy">
          {subtotal ? formatCurrency(subtotal.amount, subtotal.currencyCode) : '—'}
        </span>
      </div>
      <p className="text-xs text-nb-navy/40">Taxes and shipping calculated at checkout.</p>
      <a
        href={checkoutUrl}
        className="block w-full bg-nb-navy text-white text-center font-medium py-3.5 rounded-lg hover:bg-nb-blue transition-colors tracking-wide text-sm"
      >
        Checkout
      </a>
    </div>
  )
}
