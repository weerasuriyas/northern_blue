import {
  stubCreateCart,
  stubAddLine,
  stubUpdateLine,
  stubRemoveLine,
} from '@/lib/cart'

// variantId must match merchandise.id — the stub stores { id: variantId, ...merchandise }
// and merchandise.id overwrites the initial id due to spread order, so they must match.
const merchandise = (variantId = 'var-1', price = '10.00') => ({
  id: variantId,
  title: 'Size M',
  price: { amount: price, currencyCode: 'CAD' },
})

describe('stubCreateCart', () => {
  test('initialises an empty cart', () => {
    const cart = stubCreateCart()
    expect(cart.lines).toHaveLength(0)
    expect(cart.cost.subtotalAmount.amount).toBe('0.00')
    expect(cart.cost.totalAmount.amount).toBe('0.00')
    expect(cart.cost.subtotalAmount.currencyCode).toBe('CAD')
  })
})

describe('stubAddLine', () => {
  test('adds a new line to the cart', () => {
    const cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 1, merchandise: merchandise('var-1') })
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0].quantity).toBe(1)
    expect(cart.lines[0].merchandise.id).toBe('var-1')
  })

  test('merges duplicate variantIds instead of creating a second line', () => {
    let cart = stubCreateCart()
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 2, merchandise: merchandise('var-1') })
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 3, merchandise: merchandise('var-1') })
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0].quantity).toBe(5)
  })

  test('keeps separate lines for different variantIds', () => {
    let cart = stubCreateCart()
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 1, merchandise: merchandise('var-1', '10.00') })
    cart = stubAddLine(cart, { variantId: 'var-2', quantity: 1, merchandise: merchandise('var-2', '20.00') })
    expect(cart.lines).toHaveLength(2)
  })

  test('recalculates the subtotal after adding', () => {
    let cart = stubCreateCart()
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 2, merchandise: merchandise('var-1', '15.00') })
    expect(cart.cost.subtotalAmount.amount).toBe('30.00')
  })
})

describe('stubUpdateLine', () => {
  test('updates the quantity of an existing line', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 1, merchandise: merchandise('var-1', '10.00') })
    const lineId = cart.lines[0].id
    cart = stubUpdateLine(cart, lineId, 4)
    expect(cart.lines[0].quantity).toBe(4)
    expect(cart.cost.subtotalAmount.amount).toBe('40.00')
  })

  test('removes the line when quantity is set to 0', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 2, merchandise: merchandise('var-1') })
    const lineId = cart.lines[0].id
    cart = stubUpdateLine(cart, lineId, 0)
    expect(cart.lines).toHaveLength(0)
  })

  test('removes the line when quantity is negative', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 2, merchandise: merchandise('var-1') })
    const lineId = cart.lines[0].id
    cart = stubUpdateLine(cart, lineId, -1)
    expect(cart.lines).toHaveLength(0)
  })
})

describe('stubRemoveLine', () => {
  test('removes the matching line and keeps the other', () => {
    let cart = stubCreateCart()
    cart = stubAddLine(cart, { variantId: 'var-1', quantity: 1, merchandise: merchandise('var-1') })
    cart = stubAddLine(cart, { variantId: 'var-2', quantity: 1, merchandise: merchandise('var-2') })
    const removeId = cart.lines[0].id
    cart = stubRemoveLine(cart, removeId)
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0].merchandise.id).toBe('var-2')
  })

  test('recalculates the subtotal after removal', () => {
    let cart = stubAddLine(stubCreateCart(), { variantId: 'var-1', quantity: 3, merchandise: merchandise('var-1', '10.00') })
    const lineId = cart.lines[0].id
    cart = stubRemoveLine(cart, lineId)
    expect(cart.cost.subtotalAmount.amount).toBe('0.00')
  })
})
