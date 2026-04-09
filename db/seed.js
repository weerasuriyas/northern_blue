#!/usr/bin/env node
// Seed the database with development data.
// Run: npm run db:seed

import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://northern_blue:northern_blue@localhost:5432/northern_blue',
})

// --- Data ---

const COLLECTIONS = [
  { id: 'gid://shopify/Collection/1', title: 'Spring Collection',   handle: 'spring-collection',   description: 'Fresh florals, soft palettes — yours to wear.',              image: null },
  { id: 'gid://shopify/Collection/2', title: 'Everyday Essentials', handle: 'everyday-essentials', description: 'The pieces you reach for first, every morning.',            image: null },
  { id: 'gid://shopify/Collection/3', title: 'Workwear Edit',       handle: 'workwear-edit',        description: 'Polished. Powerful. Perfectly you.',                        image: null },
  { id: 'gid://shopify/Collection/4', title: 'Weekend Casual',      handle: 'weekend-casual',       description: 'Easy fits for the days that belong to you.',                image: null },
]

function makeVariants(basePrice) {
  return ['1X','2X','3X','4X'].map((size, i) => ({
    id: `gid://shopify/ProductVariant/stub-${basePrice}-${i}`,
    title: size,
    availableForSale: true,
    price: { amount: basePrice, currencyCode: 'CAD' },
  }))
}

const PRODUCTS = [
  { id: 'gid://shopify/Product/1',  title: 'Floral Wrap Dress',        handle: 'floral-wrap-dress',        collectionHandle: 'spring-collection',   supplierId: 'sup-1', price: '79.99',  description: 'A breezy wrap dress in a soft floral print. Flattering tie waist, flutter sleeves, midi length. Perfect for spring outings.' },
  { id: 'gid://shopify/Product/2',  title: 'Garden Print Blouse',       handle: 'garden-print-blouse',      collectionHandle: 'spring-collection',   supplierId: 'sup-1', price: '54.99',  description: 'Light and airy blouse with a botanical print. Relaxed fit, V-neckline, 3/4 sleeves. Pairs beautifully with jeans or trousers.' },
  { id: 'gid://shopify/Product/3',  title: 'Midi Skirt in Sage',        handle: 'midi-skirt-sage',          collectionHandle: 'spring-collection',   supplierId: 'sup-1', price: '64.99',  description: 'Flowy midi skirt in a calming sage green. Elastic waistband for all-day comfort. Versatile enough for work or weekend.' },
  { id: 'gid://shopify/Product/4',  title: 'Classic Jersey Tee',        handle: 'classic-jersey-tee',       collectionHandle: 'everyday-essentials', supplierId: 'sup-1', price: '34.99',  description: "The tee you'll reach for every morning. Premium cotton jersey, relaxed fit, crew neck. Available in six colours." },
  { id: 'gid://shopify/Product/5',  title: 'High-Waist Straight Jeans', handle: 'high-waist-straight-jeans',collectionHandle: 'everyday-essentials', supplierId: 'sup-2', price: '89.99',  description: 'Straight-leg jeans cut to celebrate curves. High rise, full seat, and thigh with a straight leg from knee to hem. Our most-loved fit.' },
  { id: 'gid://shopify/Product/6',  title: 'Relaxed Linen Pants',       handle: 'relaxed-linen-pants',      collectionHandle: 'everyday-essentials', supplierId: 'sup-1', price: '69.99',  description: 'Breathable linen trousers with an easy relaxed fit. Elastic waist, side pockets, tapered leg. A summer wardrobe staple.' },
  { id: 'gid://shopify/Product/7',  title: 'Tailored Blazer',           handle: 'tailored-blazer',          collectionHandle: 'workwear-edit',       supplierId: 'sup-2', price: '119.99', description: 'A structured blazer that means business. Clean lines, button closure, interior pockets. Wear open over a tee or buttoned for meetings.' },
  { id: 'gid://shopify/Product/8',  title: 'Ponte Pencil Skirt',        handle: 'ponte-pencil-skirt',       collectionHandle: 'workwear-edit',       supplierId: 'sup-2', price: '74.99',  description: 'A polished pencil skirt in smooth ponte fabric. Invisible back zip, knee length, slight stretch for comfort throughout the day.' },
  { id: 'gid://shopify/Product/9',  title: 'Button-Down Shirt Dress',   handle: 'button-down-shirt-dress',  collectionHandle: 'workwear-edit',       supplierId: 'sup-3', price: '94.99',  description: 'A crisp shirt dress that works as hard as you do. Full-length buttons, belt loops with removable belt, chest pockets.' },
  { id: 'gid://shopify/Product/10', title: 'Cozy Knit Sweater',         handle: 'cozy-knit-sweater',        collectionHandle: 'weekend-casual',      supplierId: 'sup-2', price: '69.99',  description: 'Chunky knit pullover in a soft wool-blend. Relaxed fit, ribbed cuffs and hem, cosy without feeling bulky.' },
  { id: 'gid://shopify/Product/11', title: 'French Terry Joggers',      handle: 'french-terry-joggers',     collectionHandle: 'weekend-casual',      supplierId: 'sup-1', price: '59.99',  description: 'Elevated joggers in cozy French terry. Elasticated waist with drawstring, tapered leg, deep side pockets.' },
  { id: 'gid://shopify/Product/12', title: 'Oversized Hoodie',          handle: 'oversized-hoodie',         collectionHandle: 'weekend-casual',      supplierId: 'sup-3', price: '79.99',  description: 'The ultimate weekend hoodie. Brushed fleece interior, kangaroo pocket, dropped shoulders for a relaxed oversized feel.' },
]

const CUSTOMERS = [
  { id: 'cust-1',  firstName: 'Sarah',    lastName: 'Mitchell',  email: 'sarah.mitchell@email.com', city: 'Toronto',      province: 'ON', ordersCount: 3, totalSpent: '234.97' },
  { id: 'cust-2',  firstName: 'Priya',    lastName: 'Sharma',    email: 'priya.sharma@email.com',   city: 'Vancouver',    province: 'BC', ordersCount: 2, totalSpent: '169.98' },
  { id: 'cust-3',  firstName: 'Marie',    lastName: 'Tremblay',  email: 'marie.tremblay@email.com', city: 'Montréal',     province: 'QC', ordersCount: 1, totalSpent: '94.99'  },
  { id: 'cust-4',  firstName: 'Jennifer', lastName: 'Walsh',     email: 'j.walsh@email.com',        city: 'Calgary',      province: 'AB', ordersCount: 4, totalSpent: '389.96' },
  { id: 'cust-5',  firstName: 'Aisha',    lastName: 'Okonkwo',   email: 'aisha.ok@email.com',       city: 'Ottawa',       province: 'ON', ordersCount: 1, totalSpent: '79.99'  },
  { id: 'cust-6',  firstName: 'Linda',    lastName: 'Bergeron',  email: 'l.bergeron@email.com',     city: 'Québec City',  province: 'QC', ordersCount: 2, totalSpent: '149.98' },
  { id: 'cust-7',  firstName: 'Fatima',   lastName: 'Al-Hassan', email: 'f.alhassan@email.com',     city: 'Edmonton',     province: 'AB', ordersCount: 1, totalSpent: '119.99' },
  { id: 'cust-8',  firstName: 'Wendy',    lastName: 'Kowalski',  email: 'wendy.k@email.com',        city: 'Winnipeg',     province: 'MB', ordersCount: 2, totalSpent: '144.98' },
  { id: 'cust-9',  firstName: 'Diane',    lastName: 'Leblanc',   email: 'd.leblanc@email.com',      city: 'Halifax',      province: 'NS', ordersCount: 1, totalSpent: '69.99'  },
  { id: 'cust-10', firstName: 'Rachel',   lastName: 'Thompson',  email: 'r.thompson@email.com',     city: 'Mississauga',  province: 'ON', ordersCount: 3, totalSpent: '254.97' },
]

const ORDERS = [
  {
    id: 'order-1001', name: '#1001', createdAt: '2026-04-06T14:23:00Z',
    customerId: 'cust-1', customerName: 'Sarah Mitchell', customerEmail: 'sarah.mitchell@email.com',
    lineItems: [{ title: 'Floral Wrap Dress', variantTitle: '2X', quantity: 1, price: '79.99' }],
    subtotalPrice: '79.99', totalPrice: '79.99', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Toronto', province: 'ON', country: 'Canada' },
    timeline: [
      { at: '2026-04-06T14:23:00Z', message: 'Order placed' },
      { at: '2026-04-06T16:00:00Z', message: 'Payment confirmed' },
      { at: '2026-04-07T09:15:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1002', name: '#1002', createdAt: '2026-04-06T11:05:00Z',
    customerId: 'cust-2', customerName: 'Priya Sharma', customerEmail: 'priya.sharma@email.com',
    lineItems: [
      { title: 'Classic Jersey Tee', variantTitle: '3X', quantity: 2, price: '34.99' },
      { title: 'Midi Skirt in Sage', variantTitle: '2X', quantity: 1, price: '64.99' },
    ],
    subtotalPrice: '134.97', totalPrice: '159.97', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Vancouver', province: 'BC', country: 'Canada' },
    timeline: [
      { at: '2026-04-06T11:05:00Z', message: 'Order placed' },
      { at: '2026-04-06T11:30:00Z', message: 'Payment confirmed' },
    ],
  },
  {
    id: 'order-1003', name: '#1003', createdAt: '2026-04-05T09:47:00Z',
    customerId: 'cust-3', customerName: 'Marie Tremblay', customerEmail: 'marie.tremblay@email.com',
    lineItems: [{ title: 'Button-Down Shirt Dress', variantTitle: '1X', quantity: 1, price: '94.99' }],
    subtotalPrice: '94.99', totalPrice: '94.99', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Montréal', province: 'QC', country: 'Canada' },
    timeline: [
      { at: '2026-04-05T09:47:00Z', message: 'Order placed' },
      { at: '2026-04-05T10:00:00Z', message: 'Payment confirmed' },
      { at: '2026-04-06T08:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1004', name: '#1004', createdAt: '2026-04-05T16:12:00Z',
    customerId: 'cust-4', customerName: 'Jennifer Walsh', customerEmail: 'j.walsh@email.com',
    lineItems: [
      { title: 'Tailored Blazer', variantTitle: '2X', quantity: 1, price: '119.99' },
      { title: 'Ponte Pencil Skirt', variantTitle: '2X', quantity: 1, price: '74.99' },
    ],
    subtotalPrice: '194.98', totalPrice: '194.98', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Calgary', province: 'AB', country: 'Canada' },
    timeline: [
      { at: '2026-04-05T16:12:00Z', message: 'Order placed' },
      { at: '2026-04-05T16:30:00Z', message: 'Payment confirmed' },
    ],
  },
  {
    id: 'order-1005', name: '#1005', createdAt: '2026-04-04T13:58:00Z',
    customerId: 'cust-5', customerName: 'Aisha Okonkwo', customerEmail: 'aisha.ok@email.com',
    lineItems: [{ title: 'Relaxed Linen Pants', variantTitle: '3X', quantity: 1, price: '69.99' }],
    subtotalPrice: '69.99', totalPrice: '79.99', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Ottawa', province: 'ON', country: 'Canada' },
    timeline: [
      { at: '2026-04-04T13:58:00Z', message: 'Order placed' },
      { at: '2026-04-04T14:10:00Z', message: 'Payment confirmed' },
      { at: '2026-04-05T10:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1006', name: '#1006', createdAt: '2026-04-04T08:30:00Z',
    customerId: 'cust-6', customerName: 'Linda Bergeron', customerEmail: 'l.bergeron@email.com',
    lineItems: [
      { title: 'Garden Print Blouse', variantTitle: '2X', quantity: 1, price: '54.99' },
      { title: 'Midi Skirt in Sage', variantTitle: '2X', quantity: 1, price: '64.99' },
    ],
    subtotalPrice: '119.98', totalPrice: '119.98', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Québec City', province: 'QC', country: 'Canada' },
    timeline: [
      { at: '2026-04-04T08:30:00Z', message: 'Order placed' },
      { at: '2026-04-04T08:45:00Z', message: 'Payment confirmed' },
      { at: '2026-04-05T09:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1007', name: '#1007', createdAt: '2026-04-03T20:14:00Z',
    customerId: 'cust-7', customerName: 'Fatima Al-Hassan', customerEmail: 'f.alhassan@email.com',
    lineItems: [{ title: 'Tailored Blazer', variantTitle: '1X', quantity: 1, price: '119.99' }],
    subtotalPrice: '119.99', totalPrice: '119.99', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Edmonton', province: 'AB', country: 'Canada' },
    timeline: [
      { at: '2026-04-03T20:14:00Z', message: 'Order placed' },
      { at: '2026-04-03T20:30:00Z', message: 'Payment confirmed' },
    ],
  },
  {
    id: 'order-1008', name: '#1008', createdAt: '2026-04-03T11:22:00Z',
    customerId: 'cust-8', customerName: 'Wendy Kowalski', customerEmail: 'wendy.k@email.com',
    lineItems: [
      { title: 'Cozy Knit Sweater', variantTitle: '1X', quantity: 1, price: '69.99' },
      { title: 'French Terry Joggers', variantTitle: '2X', quantity: 1, price: '59.99' },
    ],
    subtotalPrice: '129.98', totalPrice: '129.98', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Winnipeg', province: 'MB', country: 'Canada' },
    timeline: [
      { at: '2026-04-03T11:22:00Z', message: 'Order placed' },
      { at: '2026-04-03T11:35:00Z', message: 'Payment confirmed' },
      { at: '2026-04-04T10:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1009', name: '#1009', createdAt: '2026-04-02T15:03:00Z',
    customerId: 'cust-9', customerName: 'Diane Leblanc', customerEmail: 'd.leblanc@email.com',
    lineItems: [{ title: 'High-Waist Straight Jeans', variantTitle: '2X', quantity: 1, price: '69.99' }],
    subtotalPrice: '69.99', totalPrice: '69.99', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Halifax', province: 'NS', country: 'Canada' },
    timeline: [
      { at: '2026-04-02T15:03:00Z', message: 'Order placed' },
      { at: '2026-04-02T15:20:00Z', message: 'Payment confirmed' },
      { at: '2026-04-03T09:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1010', name: '#1010', createdAt: '2026-04-02T09:45:00Z',
    customerId: 'cust-10', customerName: 'Rachel Thompson', customerEmail: 'r.thompson@email.com',
    lineItems: [
      { title: 'Oversized Hoodie', variantTitle: '3X', quantity: 1, price: '79.99' },
      { title: 'Classic Jersey Tee', variantTitle: '3X', quantity: 1, price: '34.99' },
    ],
    subtotalPrice: '114.98', totalPrice: '139.98', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { city: 'Mississauga', province: 'ON', country: 'Canada' },
    timeline: [
      { at: '2026-04-02T09:45:00Z', message: 'Order placed' },
      { at: '2026-04-02T10:00:00Z', message: 'Payment confirmed' },
    ],
  },
]

const INVENTORY = [
  { id: 'inv-1',  productTitle: 'Classic Jersey Tee',        variantTitle: '1X', available: 20 },
  { id: 'inv-2',  productTitle: 'Classic Jersey Tee',        variantTitle: '2X', available: 18 },
  { id: 'inv-3',  productTitle: 'Classic Jersey Tee',        variantTitle: '3X', available: 12 },
  { id: 'inv-4',  productTitle: 'Classic Jersey Tee',        variantTitle: '4X', available: 8  },
  { id: 'inv-5',  productTitle: 'Floral Wrap Dress',         variantTitle: '1X', available: 12 },
  { id: 'inv-6',  productTitle: 'Floral Wrap Dress',         variantTitle: '2X', available: 8  },
  { id: 'inv-7',  productTitle: 'Floral Wrap Dress',         variantTitle: '3X', available: 4  },
  { id: 'inv-8',  productTitle: 'Floral Wrap Dress',         variantTitle: '4X', available: 2  },
  { id: 'inv-9',  productTitle: 'Garden Print Blouse',       variantTitle: '1X', available: 15 },
  { id: 'inv-10', productTitle: 'Garden Print Blouse',       variantTitle: '2X', available: 10 },
  { id: 'inv-11', productTitle: 'Garden Print Blouse',       variantTitle: '3X', available: 6  },
  { id: 'inv-12', productTitle: 'Garden Print Blouse',       variantTitle: '4X', available: 3  },
  { id: 'inv-13', productTitle: 'High-Waist Straight Jeans', variantTitle: '1X', available: 10 },
  { id: 'inv-14', productTitle: 'High-Waist Straight Jeans', variantTitle: '2X', available: 14 },
  { id: 'inv-15', productTitle: 'High-Waist Straight Jeans', variantTitle: '3X', available: 9  },
  { id: 'inv-16', productTitle: 'High-Waist Straight Jeans', variantTitle: '4X', available: 5  },
  { id: 'inv-17', productTitle: 'Tailored Blazer',           variantTitle: '1X', available: 7  },
  { id: 'inv-18', productTitle: 'Tailored Blazer',           variantTitle: '2X', available: 5  },
  { id: 'inv-19', productTitle: 'Tailored Blazer',           variantTitle: '3X', available: 3  },
  { id: 'inv-20', productTitle: 'Tailored Blazer',           variantTitle: '4X', available: 2  },
  { id: 'inv-21', productTitle: 'Oversized Hoodie',          variantTitle: '1X', available: 16 },
  { id: 'inv-22', productTitle: 'Oversized Hoodie',          variantTitle: '2X', available: 11 },
  { id: 'inv-23', productTitle: 'Oversized Hoodie',          variantTitle: '3X', available: 6  },
  { id: 'inv-24', productTitle: 'Oversized Hoodie',          variantTitle: '4X', available: 2  },
]

const SUPPLIERS = [
  { id: 'sup-1', name: 'Maple Textiles Co.',  contactName: 'Jane Doe',  contactEmail: 'orders@mapletextiles.ca',         phone: '+1-416-555-0100', country: 'Canada',        leadTimeDays: 5,  integrationType: 'email',  apiEndpoint: null, apiKey: null, active: true,  notes: 'Minimum order 3 units per SKU. Lead time 5 business days.', productCount: 6 },
  { id: 'sup-2', name: 'True North Apparel',  contactName: 'Mike Chen', contactEmail: 'fulfillment@truenorthapparel.ca', phone: '+1-604-555-0177', country: 'Canada',        leadTimeDays: 7,  integrationType: 'manual', apiEndpoint: null, apiKey: null, active: true,  notes: 'Send orders via email. They ship via Canada Post.',          productCount: 4 },
  { id: 'sup-3', name: 'StyleForward Inc.',   contactName: 'Amy Ross',  contactEmail: 'api@styleforward.com',            phone: '+1-800-555-0199', country: 'United States', leadTimeDays: 10, integrationType: 'api',    apiEndpoint: 'https://api.styleforward.com/v1/orders', apiKey: null, active: false, notes: 'US supplier, duties apply. API integration pending.', productCount: 2 },
]

const DISCOUNTS = [
  { id: 'disc-1', code: 'WELCOME15', type: 'percentage',    value: 15,   minOrderAmount: '0',  usageLimit: null, usageCount: 47,  startsAt: '2026-01-01', expiresAt: null,         active: true,  summary: '15% off everything'          },
  { id: 'disc-2', code: 'SPRING20',  type: 'percentage',    value: 20,   minOrderAmount: '75', usageLimit: 200,  usageCount: 83,  startsAt: '2026-03-01', expiresAt: '2026-05-31', active: true,  summary: '20% off orders over $75'     },
  { id: 'disc-3', code: 'FREESHIP',  type: 'free_shipping', value: 0,    minOrderAmount: '50', usageLimit: null, usageCount: 124, startsAt: '2026-01-01', expiresAt: null,         active: true,  summary: 'Free shipping on orders over $50' },
  { id: 'disc-4', code: 'SAVE10',    type: 'fixed_amount',  value: 10,   minOrderAmount: '60', usageLimit: 100,  usageCount: 100, startsAt: '2026-02-01', expiresAt: '2026-03-31', active: false, summary: '$10 off orders over $60'     },
]

const RETURNS = [
  {
    id: 'return-1', orderId: 'order-1002', orderName: '#1002', customerId: 'cust-2',
    customerName: 'Priya Sharma', customerEmail: 'priya.sharma@email.com',
    requestedAt: '2026-04-07T10:00:00Z', reason: 'Wrong size — ordered 3X but needs 2X',
    items: [{ title: 'Classic Jersey Tee', variantTitle: '3X', quantity: 1, price: '34.99' }],
    refundAmount: '34.99', currencyCode: 'CAD', status: 'requested',
    timeline: [{ at: '2026-04-07T10:00:00Z', message: 'Return requested by customer' }],
    notes: '',
  },
  {
    id: 'return-2', orderId: 'order-1004', orderName: '#1004', customerId: 'cust-4',
    customerName: 'Jennifer Walsh', customerEmail: 'j.walsh@email.com',
    requestedAt: '2026-04-06T14:30:00Z', reason: 'Item not as described',
    items: [{ title: 'Tailored Blazer', variantTitle: '2X', quantity: 1, price: '119.99' }],
    refundAmount: '119.99', currencyCode: 'CAD', status: 'approved',
    timeline: [
      { at: '2026-04-06T14:30:00Z', message: 'Return requested by customer' },
      { at: '2026-04-06T16:00:00Z', message: 'Return approved by admin' },
    ],
    notes: 'Customer to ship back within 14 days.',
  },
  {
    id: 'return-3', orderId: 'order-1006', orderName: '#1006', customerId: 'cust-6',
    customerName: 'Linda Bergeron', customerEmail: 'l.bergeron@email.com',
    requestedAt: '2026-04-05T09:00:00Z', reason: 'Changed mind',
    items: [{ title: 'Midi Skirt in Sage', variantTitle: '2X', quantity: 1, price: '64.99' }],
    refundAmount: '64.99', currencyCode: 'CAD', status: 'refunded',
    timeline: [
      { at: '2026-04-05T09:00:00Z', message: 'Return requested by customer' },
      { at: '2026-04-05T11:00:00Z', message: 'Return approved by admin' },
      { at: '2026-04-06T10:00:00Z', message: 'Refund of $64.99 CAD issued' },
    ],
    notes: '',
  },
  {
    id: 'return-4', orderId: 'order-1008', orderName: '#1008', customerId: 'cust-8',
    customerName: 'Wendy Kowalski', customerEmail: 'wendy.k@email.com',
    requestedAt: '2026-04-07T16:45:00Z', reason: 'Defective item — seam split on first wear',
    items: [{ title: 'Cozy Knit Sweater', variantTitle: '1X', quantity: 1, price: '69.99' }],
    refundAmount: '69.99', currencyCode: 'CAD', status: 'declined',
    timeline: [
      { at: '2026-04-07T16:45:00Z', message: 'Return requested by customer' },
      { at: '2026-04-07T17:30:00Z', message: 'Return declined — outside 14-day return window' },
    ],
    notes: 'Outside return window.',
  },
]

const REVENUE = [
  { date: '2026-03-09', amount: 0      }, { date: '2026-03-10', amount: 189.97 },
  { date: '2026-03-11', amount: 214.98 }, { date: '2026-03-12', amount: 94.99  },
  { date: '2026-03-13', amount: 159.98 }, { date: '2026-03-14', amount: 0      },
  { date: '2026-03-15', amount: 0      }, { date: '2026-03-16', amount: 279.97 },
  { date: '2026-03-17', amount: 119.99 }, { date: '2026-03-18', amount: 194.98 },
  { date: '2026-03-19', amount: 89.99  }, { date: '2026-03-20', amount: 239.97 },
  { date: '2026-03-21', amount: 0      }, { date: '2026-03-22', amount: 79.99  },
  { date: '2026-03-23', amount: 154.98 }, { date: '2026-03-24', amount: 299.97 },
  { date: '2026-03-25', amount: 119.99 }, { date: '2026-03-26', amount: 184.98 },
  { date: '2026-03-27', amount: 64.99  }, { date: '2026-03-28', amount: 0      },
  { date: '2026-03-29', amount: 109.99 }, { date: '2026-03-30', amount: 244.97 },
  { date: '2026-03-31', amount: 174.98 }, { date: '2026-04-01', amount: 199.98 },
  { date: '2026-04-02', amount: 209.97 }, { date: '2026-04-03', amount: 249.97 },
  { date: '2026-04-04', amount: 199.97 }, { date: '2026-04-05', amount: 94.99  },
  { date: '2026-04-06', amount: 239.96 }, { date: '2026-04-07', amount: 79.99  },
]

// --- Seed ---

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    console.log('Seeding collections...')
    for (const c of COLLECTIONS) {
      await client.query(
        `INSERT INTO collections (id, title, handle, description, image)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, handle = EXCLUDED.handle,
           description = EXCLUDED.description, image = EXCLUDED.image`,
        [c.id, c.title, c.handle, c.description, c.image]
      )
    }

    console.log('Seeding products...')
    for (const p of PRODUCTS) {
      await client.query(
        `INSERT INTO products
           (id, title, handle, description, collection_handle, supplier_id, price_min, currency_code, images, variants)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, handle = EXCLUDED.handle,
           description = EXCLUDED.description, collection_handle = EXCLUDED.collection_handle,
           supplier_id = EXCLUDED.supplier_id,
           price_min = EXCLUDED.price_min, variants = EXCLUDED.variants`,
        [
          p.id, p.title, p.handle, p.description, p.collectionHandle, p.supplierId,
          p.price, 'CAD', '[]',
          JSON.stringify(makeVariants(p.price)),
        ]
      )
    }

    console.log('Seeding customers...')
    for (const c of CUSTOMERS) {
      await client.query(
        `INSERT INTO customers (id, first_name, last_name, email, city, province, orders_count, total_spent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
           email = EXCLUDED.email, city = EXCLUDED.city, province = EXCLUDED.province,
           orders_count = EXCLUDED.orders_count, total_spent = EXCLUDED.total_spent`,
        [c.id, c.firstName, c.lastName, c.email, c.city, c.province, c.ordersCount, c.totalSpent]
      )
    }

    console.log('Seeding orders...')
    for (const o of ORDERS) {
      await client.query(
        `INSERT INTO orders
           (id, name, customer_id, customer_name, customer_email,
            line_items, subtotal_price, total_price, currency_code,
            fulfillment_status, financial_status, shipping_address, timeline, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, line_items = EXCLUDED.line_items,
           subtotal_price = EXCLUDED.subtotal_price, total_price = EXCLUDED.total_price,
           fulfillment_status = EXCLUDED.fulfillment_status,
           financial_status = EXCLUDED.financial_status,
           shipping_address = EXCLUDED.shipping_address, timeline = EXCLUDED.timeline`,
        [
          o.id, o.name, o.customerId, o.customerName, o.customerEmail,
          JSON.stringify(o.lineItems), o.subtotalPrice, o.totalPrice, o.currencyCode,
          o.fulfillmentStatus, o.financialStatus,
          JSON.stringify(o.shippingAddress), JSON.stringify(o.timeline), o.createdAt,
        ]
      )
    }

    console.log('Seeding inventory...')
    for (const inv of INVENTORY) {
      await client.query(
        `INSERT INTO inventory (id, product_title, variant_title, available)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET
           product_title = EXCLUDED.product_title,
           variant_title = EXCLUDED.variant_title,
           available = EXCLUDED.available`,
        [inv.id, inv.productTitle, inv.variantTitle, inv.available]
      )
    }

    console.log('Seeding suppliers...')
    for (const s of SUPPLIERS) {
      await client.query(
        `INSERT INTO suppliers
           (id, name, contact_name, contact_email, phone, country,
            lead_time_days, integration_type, api_endpoint, api_key,
            active, notes, product_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, contact_name = EXCLUDED.contact_name,
           contact_email = EXCLUDED.contact_email, phone = EXCLUDED.phone,
           country = EXCLUDED.country, lead_time_days = EXCLUDED.lead_time_days,
           integration_type = EXCLUDED.integration_type, active = EXCLUDED.active,
           notes = EXCLUDED.notes, product_count = EXCLUDED.product_count`,
        [
          s.id, s.name, s.contactName, s.contactEmail, s.phone, s.country,
          s.leadTimeDays, s.integrationType, s.apiEndpoint, s.apiKey,
          s.active, s.notes, s.productCount,
        ]
      )
    }

    console.log('Seeding discounts...')
    for (const d of DISCOUNTS) {
      await client.query(
        `INSERT INTO discounts
           (id, code, type, value, min_order_amount, usage_limit,
            usage_count, starts_at, expires_at, active, summary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           code = EXCLUDED.code, type = EXCLUDED.type, value = EXCLUDED.value,
           min_order_amount = EXCLUDED.min_order_amount, usage_limit = EXCLUDED.usage_limit,
           usage_count = EXCLUDED.usage_count, starts_at = EXCLUDED.starts_at,
           expires_at = EXCLUDED.expires_at, active = EXCLUDED.active, summary = EXCLUDED.summary`,
        [
          d.id, d.code, d.type, d.value, d.minOrderAmount, d.usageLimit,
          d.usageCount, d.startsAt || null, d.expiresAt || null, d.active, d.summary,
        ]
      )
    }

    console.log('Seeding returns...')
    for (const r of RETURNS) {
      await client.query(
        `INSERT INTO returns
           (id, order_id, order_name, customer_id, customer_name, customer_email,
            requested_at, reason, items, refund_amount, currency_code, status, timeline, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status, timeline = EXCLUDED.timeline, notes = EXCLUDED.notes`,
        [
          r.id, r.orderId, r.orderName, r.customerId, r.customerName, r.customerEmail,
          r.requestedAt, r.reason, JSON.stringify(r.items),
          r.refundAmount, r.currencyCode, r.status,
          JSON.stringify(r.timeline), r.notes,
        ]
      )
    }

    console.log('Seeding revenue...')
    for (const rev of REVENUE) {
      await client.query(
        `INSERT INTO revenue (date, amount) VALUES ($1,$2)
         ON CONFLICT (date) DO UPDATE SET amount = EXCLUDED.amount`,
        [rev.date, rev.amount]
      )
    }

    await client.query('COMMIT')
    console.log('✓ Seed complete')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
