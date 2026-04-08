// Cart operations — stub implementation using in-memory state.
// CartContext is the source of truth; these helpers return data
// in the same shape as Shopify's Cart API so swapping is a drop-in.
//
// To wire up Shopify Cart API:
//   Replace each function body with a GraphQL mutation via the Storefront API.

let _nextLineId = 1

export function stubCreateCart() {
  return {
    id: 'stub-cart',
    checkoutUrl: '#checkout-not-configured',
    lines: [],
    cost: {
      subtotalAmount: { amount: '0.00', currencyCode: 'CAD' },
      totalAmount: { amount: '0.00', currencyCode: 'CAD' },
    },
  }
}

export function stubAddLine(cart, { variantId, quantity, merchandise }) {
  const existing = cart.lines.find(l => l.merchandise.id === variantId)
  let lines
  if (existing) {
    lines = cart.lines.map(l =>
      l.merchandise.id === variantId
        ? { ...l, quantity: l.quantity + quantity }
        : l
    )
  } else {
    lines = [
      ...cart.lines,
      {
        id: `stub-line-${_nextLineId++}`,
        quantity,
        merchandise: { id: variantId, ...merchandise },
      },
    ]
  }
  return recalculate({ ...cart, lines })
}

export function stubUpdateLine(cart, lineId, quantity) {
  const lines =
    quantity <= 0
      ? cart.lines.filter(l => l.id !== lineId)
      : cart.lines.map(l => (l.id === lineId ? { ...l, quantity } : l))
  return recalculate({ ...cart, lines })
}

export function stubRemoveLine(cart, lineId) {
  return recalculate({ ...cart, lines: cart.lines.filter(l => l.id !== lineId) })
}

function recalculate(cart) {
  const subtotal = cart.lines.reduce(
    (sum, l) => sum + parseFloat(l.merchandise.price.amount) * l.quantity,
    0
  )
  const amount = subtotal.toFixed(2)
  return {
    ...cart,
    cost: {
      subtotalAmount: { amount, currencyCode: 'CAD' },
      totalAmount: { amount, currencyCode: 'CAD' },
    },
  }
}
