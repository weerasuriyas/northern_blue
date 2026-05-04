import {
  stubCreateCart,
  stubAddLine,
  stubUpdateLine,
  stubRemoveLine,
} from '@/lib/cart'

// variantId must match merchandise.id — the stub spreads merchandise after
// setting id, so merchandise.id wins over the initial id assignment.
const item = (variantId = 'var-1', price = '10.00') => ({
  id: variantId,
  title: 'Size M',
  price: { amount: price, currencyCode: 'CAD' },
})

describe('stubCreateCart — initial cart state', () => {
  test('new cart starts empty with $0.00 subtotal', () => {
    const cart = stubCreateCart()
    expect(cart.lines).toHaveLength(0)
    expect(cart.cost.subtotalAmount.amount).toBe('0.00')
    expect(cart.cost.totalAmount.amount).toBe('0.00')
    expect(cart.cost.subtotalAmount.currencyCode).toBe('CAD')
  })
})

describe('stubAddLine — adding items', () => {
  test('adding a product creates a cart line', () => {
    const cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 1, merchandise: item('var-1') })
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0].quantity).toBe(1)
    expect(cart.lines[0].merchandise.id).toBe('var-1')
  })

  test('adding the same variant twice increases quantity — no duplicate lines', () => {
    let cart = stubCreateCart()
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 2, merchandise: item('var-1') })
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 3, merchandise: item('var-1') })
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0].quantity).toBe(5)
  })

  test('different variants each get their own line', () => {
    let cart = stubCreateCart()
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 1, merchandise: item('var-1', '10.00') })
    cart = stubAddLine(cart, { variantId: 'var-2', quantity: 1, merchandise: item('var-2', '20.00') })
    expect(cart.lines).toHaveLength(2)
  })

  test('subtotal is recalculated immediately — no stale price shown', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 2, merchandise: item('var-1', '15.00') })
    expect(cart.cost.subtotalAmount.amount).toBe('30.00')
  })
})

describe('stubUpdateLine — changing quantities', () => {
  test('updating quantity recalculates the subtotal', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 1, merchandise: item('var-1', '10.00') })
    cart = stubUpdateLine(cart, cart.lines[0].id, 4)
    expect(cart.lines[0].quantity).toBe(4)
    expect(cart.cost.subtotalAmount.amount).toBe('40.00')
  })

  test('setting quantity to 0 removes the item', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 2, merchandise: item('var-1') })
    cart = stubUpdateLine(cart, cart.lines[0].id, 0)
    expect(cart.lines).toHaveLength(0)
  })

  test('negative quantity removes the item', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 2, merchandise: item('var-1') })
    cart = stubUpdateLine(cart, cart.lines[0].id, -1)
    expect(cart.lines).toHaveLength(0)
  })
})

describe('stubRemoveLine — removing items', () => {
  test('removing one item preserves other lines', () => {
    let cart = stubCreateCart()
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 1, merchandise: item('var-1') })
    cart = stubAddLine(cart, { variantId: 'var-2', quantity: 1, merchandise: item('var-2') })
    cart = stubRemoveLine(cart, cart.lines[0].id)
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0].merchandise.id).toBe('var-2')
  })

  test('removing the only item zeroes the subtotal — no phantom charges', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 3, merchandise: item('var-1', '10.00') })
    cart = stubRemoveLine(cart, cart.lines[0].id)
    expect(cart.cost.subtotalAmount.amount).toBe('0.00')
  })
})
