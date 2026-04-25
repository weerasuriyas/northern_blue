#!/usr/bin/env node
// Seed the database with development data.
// Run: npm run db:seed

import mysql from 'mysql2/promise'

const pool = mysql.createPool(
  process.env.DATABASE_URL || {
    host:     'localhost',
    port:      3306,
    user:     'northern_blue',
    password: 'northern_blue',
    database: 'northern_blue',
    waitForConnections: true,
    connectionLimit: 5,
    multipleStatements: false,
  }
)

// Convert ISO-8601 strings ('2026-04-06T14:23:00Z') to MySQL DATETIME format
// ('2026-04-06 14:23:00'). MySQL doesn't accept the trailing 'Z'.
function dt(iso) {
  if (iso == null) return null
  return String(iso).replace('T', ' ').replace(/\.\d+Z?$/, '').replace(/Z$/, '')
}

// --- Data ---

const COLLECTIONS = [
  { id: 'gid://shopify/Collection/1', title: 'Spring Collection',   handle: 'spring-collection',   description: 'Fresh florals, soft palettes — yours to wear.',              image: null },
  { id: 'gid://shopify/Collection/2', title: 'Everyday Essentials', handle: 'everyday-essentials', description: 'The pieces you reach for first, every morning.',            image: null },
  { id: 'gid://shopify/Collection/3', title: 'Workwear Edit',       handle: 'workwear-edit',        description: 'Polished. Powerful. Perfectly you.',                        image: null },
  { id: 'gid://shopify/Collection/4', title: 'Weekend Casual',      handle: 'weekend-casual',       description: 'Easy fits for the days that belong to you.',                image: null },
]

// Variant options shape mirrors Shopify products.options
const SIZE_OPTION = { id: 'gid://shopify/ProductOption/1', name: 'Size', position: 1, values: ['1X', '2X', '3X', '4X'] }

// Mirrors Shopify ProductVariant fields exactly
function makeVariants(productNumId, skuPrefix, basePrice) {
  return ['1X', '2X', '3X', '4X'].map((size, i) => ({
    id:                   `gid://shopify/ProductVariant/${productNumId}${i + 1}`,
    product_id:           `gid://shopify/Product/${productNumId}`,
    title:                size,
    sku:                  `NB-${skuPrefix}-${size}`,
    price:                basePrice,
    compare_at_price:     null,
    inventory_item_id:    `gid://shopify/InventoryItem/${productNumId}${i + 1}`,
    inventory_quantity:   0,               // kept live via inventory table
    inventory_management: 'shopify',
    inventory_policy:     'deny',
    weight:               0.3,
    weight_unit:          'kg',
    barcode:              null,
    requires_shipping:    true,
    taxable:              true,
    availableForSale:     true,
    option1:              size,
    option2:              null,
    option3:              null,
    position:             i + 1,
  }))
}

const PRODUCTS = [
  // id, title, handle, collection, vendor (supplier name), product_type, tags, supplierId, price, sku prefix, description
  { id: 'gid://shopify/Product/1',  title: 'Floral Wrap Dress',        handle: 'floral-wrap-dress',         collectionHandle: 'spring-collection',   vendor: 'Maple Textiles Co.',  productType: 'Dress',   tags: 'floral,wrap,midi,spring',        supplierId: 'sup-1', skuPrefix: 'FWD',  price: '79.99',  description: 'A breezy wrap dress in a soft floral print. Flattering tie waist, flutter sleeves, midi length. Perfect for spring outings.' },
  { id: 'gid://shopify/Product/2',  title: 'Garden Print Blouse',       handle: 'garden-print-blouse',       collectionHandle: 'spring-collection',   vendor: 'Maple Textiles Co.',  productType: 'Blouse',  tags: 'blouse,print,spring,v-neck',     supplierId: 'sup-1', skuPrefix: 'GPB',  price: '54.99',  description: 'Light and airy blouse with a botanical print. Relaxed fit, V-neckline, 3/4 sleeves. Pairs beautifully with jeans or trousers.' },
  { id: 'gid://shopify/Product/3',  title: 'Midi Skirt in Sage',        handle: 'midi-skirt-sage',           collectionHandle: 'spring-collection',   vendor: 'Maple Textiles Co.',  productType: 'Skirt',   tags: 'midi,skirt,sage,green,spring',   supplierId: 'sup-1', skuPrefix: 'MSS',  price: '64.99',  description: 'Flowy midi skirt in a calming sage green. Elastic waistband for all-day comfort. Versatile enough for work or weekend.' },
  { id: 'gid://shopify/Product/4',  title: 'Classic Jersey Tee',        handle: 'classic-jersey-tee',        collectionHandle: 'everyday-essentials', vendor: 'Maple Textiles Co.',  productType: 'Top',     tags: 'tee,jersey,cotton,everyday',     supplierId: 'sup-1', skuPrefix: 'CJT',  price: '34.99',  description: "The tee you'll reach for every morning. Premium cotton jersey, relaxed fit, crew neck. Available in six colours." },
  { id: 'gid://shopify/Product/5',  title: 'High-Waist Straight Jeans', handle: 'high-waist-straight-jeans', collectionHandle: 'everyday-essentials', vendor: 'True North Apparel',  productType: 'Jeans',   tags: 'jeans,denim,high-waist,straight',supplierId: 'sup-2', skuPrefix: 'HWSJ', price: '89.99',  description: 'Straight-leg jeans cut to celebrate curves. High rise, full seat, and thigh with a straight leg from knee to hem. Our most-loved fit.' },
  { id: 'gid://shopify/Product/6',  title: 'Relaxed Linen Pants',       handle: 'relaxed-linen-pants',       collectionHandle: 'everyday-essentials', vendor: 'Maple Textiles Co.',  productType: 'Pants',   tags: 'linen,pants,summer,relaxed',     supplierId: 'sup-1', skuPrefix: 'RLP',  price: '69.99',  description: 'Breathable linen trousers with an easy relaxed fit. Elastic waist, side pockets, tapered leg. A summer wardrobe staple.' },
  { id: 'gid://shopify/Product/7',  title: 'Tailored Blazer',           handle: 'tailored-blazer',           collectionHandle: 'workwear-edit',       vendor: 'True North Apparel',  productType: 'Blazer',  tags: 'blazer,workwear,tailored',       supplierId: 'sup-2', skuPrefix: 'TBL',  price: '119.99', description: 'A structured blazer that means business. Clean lines, button closure, interior pockets. Wear open over a tee or buttoned for meetings.' },
  { id: 'gid://shopify/Product/8',  title: 'Ponte Pencil Skirt',        handle: 'ponte-pencil-skirt',        collectionHandle: 'workwear-edit',       vendor: 'True North Apparel',  productType: 'Skirt',   tags: 'skirt,ponte,pencil,workwear',    supplierId: 'sup-2', skuPrefix: 'PPS',  price: '74.99',  description: 'A polished pencil skirt in smooth ponte fabric. Invisible back zip, knee length, slight stretch for comfort throughout the day.' },
  { id: 'gid://shopify/Product/9',  title: 'Button-Down Shirt Dress',   handle: 'button-down-shirt-dress',   collectionHandle: 'workwear-edit',       vendor: 'StyleForward Inc.',   productType: 'Dress',   tags: 'dress,shirt-dress,workwear',     supplierId: 'sup-3', skuPrefix: 'BSD',  price: '94.99',  description: 'A crisp shirt dress that works as hard as you do. Full-length buttons, belt loops with removable belt, chest pockets.' },
  { id: 'gid://shopify/Product/10', title: 'Cozy Knit Sweater',         handle: 'cozy-knit-sweater',         collectionHandle: 'weekend-casual',      vendor: 'True North Apparel',  productType: 'Sweater', tags: 'sweater,knit,cozy,weekend',      supplierId: 'sup-2', skuPrefix: 'CKS',  price: '69.99',  description: 'Chunky knit pullover in a soft wool-blend. Relaxed fit, ribbed cuffs and hem, cosy without feeling bulky.' },
  { id: 'gid://shopify/Product/11', title: 'French Terry Joggers',      handle: 'french-terry-joggers',      collectionHandle: 'weekend-casual',      vendor: 'Maple Textiles Co.',  productType: 'Pants',   tags: 'joggers,loungewear,terry,casual',supplierId: 'sup-1', skuPrefix: 'FTJ',  price: '59.99',  description: 'Elevated joggers in cozy French terry. Elasticated waist with drawstring, tapered leg, deep side pockets.' },
  { id: 'gid://shopify/Product/12', title: 'Oversized Hoodie',          handle: 'oversized-hoodie',          collectionHandle: 'weekend-casual',      vendor: 'StyleForward Inc.',   productType: 'Hoodie',  tags: 'hoodie,fleece,oversized,casual', supplierId: 'sup-3', skuPrefix: 'OSH',  price: '79.99',  description: 'The ultimate weekend hoodie. Brushed fleece interior, kangaroo pocket, dropped shoulders for a relaxed oversized feel.' },
]

const CUSTOMERS = [
  { id: 'cust-1',  firstName: 'Sarah',    lastName: 'Mitchell',  email: 'sarah.mitchell@email.com', phone: '+14165550312', city: 'Toronto',      province: 'ON', ordersCount: 3, totalSpent: '234.97', lastOrderId: 'order-1001', lastOrderName: '#1001', state: 'enabled', tags: 'vip',       taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-2',  firstName: 'Priya',    lastName: 'Sharma',    email: 'priya.sharma@email.com',   phone: '+16045550841', city: 'Vancouver',    province: 'BC', ordersCount: 2, totalSpent: '169.98', lastOrderId: 'order-1002', lastOrderName: '#1002', state: 'enabled', tags: '',          taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-3',  firstName: 'Marie',    lastName: 'Tremblay',  email: 'marie.tremblay@email.com', phone: '+15145550274', city: 'Montréal',     province: 'QC', ordersCount: 1, totalSpent: '94.99',  lastOrderId: 'order-1003', lastOrderName: '#1003', state: 'enabled', tags: '',          taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-4',  firstName: 'Jennifer', lastName: 'Walsh',     email: 'j.walsh@email.com',        phone: '+14035550193', city: 'Calgary',      province: 'AB', ordersCount: 4, totalSpent: '389.96', lastOrderId: 'order-1004', lastOrderName: '#1004', state: 'enabled', tags: 'vip,repeat', taxExempt: false, verifiedEmail: true, note: 'Prefers express shipping.' },
  { id: 'cust-5',  firstName: 'Aisha',    lastName: 'Okonkwo',   email: 'aisha.ok@email.com',       phone: '+16135550467', city: 'Ottawa',       province: 'ON', ordersCount: 1, totalSpent: '79.99',  lastOrderId: 'order-1005', lastOrderName: '#1005', state: 'enabled', tags: '',          taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-6',  firstName: 'Linda',    lastName: 'Bergeron',  email: 'l.bergeron@email.com',     phone: '+14185550852', city: 'Québec City',  province: 'QC', ordersCount: 2, totalSpent: '149.98', lastOrderId: 'order-1006', lastOrderName: '#1006', state: 'enabled', tags: '',          taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-7',  firstName: 'Fatima',   lastName: 'Al-Hassan', email: 'f.alhassan@email.com',     phone: '+17805550629', city: 'Edmonton',     province: 'AB', ordersCount: 1, totalSpent: '119.99', lastOrderId: 'order-1007', lastOrderName: '#1007', state: 'enabled', tags: '',          taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-8',  firstName: 'Wendy',    lastName: 'Kowalski',  email: 'wendy.k@email.com',        phone: '+12045550738', city: 'Winnipeg',     province: 'MB', ordersCount: 2, totalSpent: '144.98', lastOrderId: 'order-1008', lastOrderName: '#1008', state: 'enabled', tags: '',          taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-9',  firstName: 'Diane',    lastName: 'Leblanc',   email: 'd.leblanc@email.com',      phone: '+19025550514', city: 'Halifax',      province: 'NS', ordersCount: 1, totalSpent: '69.99',  lastOrderId: 'order-1009', lastOrderName: '#1009', state: 'enabled', tags: '',          taxExempt: false, verifiedEmail: true, note: '' },
  { id: 'cust-10', firstName: 'Rachel',   lastName: 'Thompson',  email: 'r.thompson@email.com',     phone: '+19055550286', city: 'Mississauga',  province: 'ON', ordersCount: 3, totalSpent: '254.97', lastOrderId: 'order-1010', lastOrderName: '#1010', state: 'enabled', tags: 'newsletter', taxExempt: false, verifiedEmail: true, note: '' },
]

// Billing addresses (usually same as shipping for online orders)
const BILLING = {
  'cust-1':  { name: 'Sarah Mitchell',    firstName: 'Sarah',    lastName: 'Mitchell',  address1: '847 Spadina Ave',            address2: 'Apt 4B',   city: 'Toronto',      province: 'ON', provinceCode: 'ON', zip: 'M5S 2J5', country: 'Canada', countryCode: 'CA', phone: '+14165550312' },
  'cust-2':  { name: 'Priya Sharma',      firstName: 'Priya',    lastName: 'Sharma',    address1: '2156 W 4th Ave',             address2: null,       city: 'Vancouver',    province: 'BC', provinceCode: 'BC', zip: 'V6K 1N6', country: 'Canada', countryCode: 'CA', phone: '+16045550841' },
  'cust-3':  { name: 'Marie Tremblay',    firstName: 'Marie',    lastName: 'Tremblay',  address1: '3842 Rue Sherbrooke Ouest',  address2: null,       city: 'Montréal',     province: 'QC', provinceCode: 'QC', zip: 'H3Z 1E9', country: 'Canada', countryCode: 'CA', phone: '+15145550274' },
  'cust-4':  { name: 'Jennifer Walsh',    firstName: 'Jennifer', lastName: 'Walsh',     address1: '1423 17 Ave SW',             address2: 'Unit 205', city: 'Calgary',      province: 'AB', provinceCode: 'AB', zip: 'T2T 0C9', country: 'Canada', countryCode: 'CA', phone: '+14035550193' },
  'cust-5':  { name: 'Aisha Okonkwo',     firstName: 'Aisha',    lastName: 'Okonkwo',   address1: '560 Rideau St',              address2: 'Apt 303',  city: 'Ottawa',       province: 'ON', provinceCode: 'ON', zip: 'K1N 5Z5', country: 'Canada', countryCode: 'CA', phone: '+16135550467' },
  'cust-6':  { name: 'Linda Bergeron',    firstName: 'Linda',    lastName: 'Bergeron',  address1: '975 Grande Allée Est',       address2: null,       city: 'Québec City',  province: 'QC', provinceCode: 'QC', zip: 'G1R 2K4', country: 'Canada', countryCode: 'CA', phone: '+14185550852' },
  'cust-7':  { name: 'Fatima Al-Hassan',  firstName: 'Fatima',   lastName: 'Al-Hassan', address1: '10234 82 Ave NW',            address2: null,       city: 'Edmonton',     province: 'AB', provinceCode: 'AB', zip: 'T6E 1Z5', country: 'Canada', countryCode: 'CA', phone: '+17805550629' },
  'cust-8':  { name: 'Wendy Kowalski',    firstName: 'Wendy',    lastName: 'Kowalski',  address1: '156 River Ave',              address2: 'Unit 12',  city: 'Winnipeg',     province: 'MB', provinceCode: 'MB', zip: 'R3L 0A3', country: 'Canada', countryCode: 'CA', phone: '+12045550738' },
  'cust-9':  { name: 'Diane Leblanc',     firstName: 'Diane',    lastName: 'Leblanc',   address1: '1479 Barrington St',         address2: 'Apt 2',    city: 'Halifax',      province: 'NS', provinceCode: 'NS', zip: 'B3J 1Z1', country: 'Canada', countryCode: 'CA', phone: '+19025550514' },
  'cust-10': { name: 'Rachel Thompson',   firstName: 'Rachel',   lastName: 'Thompson',  address1: '3420 Hurontario St',         address2: 'Unit 611', city: 'Mississauga',  province: 'ON', provinceCode: 'ON', zip: 'L5B 4R4', country: 'Canada', countryCode: 'CA', phone: '+19055550286' },
}

// Line item helper — mirrors Shopify line_item object
function li(lineItemNumId, productNumId, variantIdx, title, vendor, sku, variantTitle, quantity, price, fulfillmentStatus) {
  return {
    id:                 `gid://shopify/LineItem/${lineItemNumId}`,
    product_id:         `gid://shopify/Product/${productNumId}`,
    variant_id:         `gid://shopify/ProductVariant/${productNumId}${variantIdx}`,
    title,
    variant_title:      variantTitle,
    name:               `${title} - ${variantTitle}`,
    sku:                `NB-${sku}-${variantTitle}`,
    vendor,
    quantity,
    current_quantity:   quantity,
    price,
    requires_shipping:  true,
    taxable:            true,
    fulfillment_status: fulfillmentStatus,  // null | 'fulfilled' | 'partial'
    gift_card:          false,
  }
}

const ORDERS = [
  {
    id: 'order-1001', name: '#1001', orderNumber: 1001, createdAt: '2026-04-06T14:23:00Z',
    customerId: 'cust-1', customerName: 'Sarah Mitchell', customerEmail: 'sarah.mitchell@email.com', phone: '+14165550312',
    lineItems: [
      li('10011', 1, 2, 'Floral Wrap Dress', 'Maple Textiles Co.', 'FWD', '2X', 1, '79.99', 'fulfilled'),
    ],
    subtotalPrice: '79.99', totalTax: '10.40', totalPrice: '90.39', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-1'] },
    billingAddress:  { ...BILLING['cust-1'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-06T14:23:00Z', message: 'Order placed' },
      { at: '2026-04-06T16:00:00Z', message: 'Payment confirmed' },
      { at: '2026-04-06T17:00:00Z', message: 'Order forwarded to Maple Textiles Co. (ref: NB-1001-SUP1)' },
      { at: '2026-04-07T09:15:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1002', name: '#1002', orderNumber: 1002, createdAt: '2026-04-06T11:05:00Z',
    customerId: 'cust-2', customerName: 'Priya Sharma', customerEmail: 'priya.sharma@email.com', phone: '+16045550841',
    lineItems: [
      li('10021', 4, 3, 'Classic Jersey Tee',  'Maple Textiles Co.', 'CJT',  '3X', 2, '34.99', null),
      li('10022', 3, 2, 'Midi Skirt in Sage',  'Maple Textiles Co.', 'MSS',  '2X', 1, '64.99', null),
    ],
    subtotalPrice: '134.97', totalTax: '17.55', totalPrice: '152.52', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-2'] },
    billingAddress:  { ...BILLING['cust-2'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-06T11:05:00Z', message: 'Order placed' },
      { at: '2026-04-06T11:30:00Z', message: 'Payment confirmed' },
    ],
  },
  {
    id: 'order-1003', name: '#1003', orderNumber: 1003, createdAt: '2026-04-05T09:47:00Z',
    customerId: 'cust-3', customerName: 'Marie Tremblay', customerEmail: 'marie.tremblay@email.com', phone: '+15145550274',
    lineItems: [
      li('10031', 9, 1, 'Button-Down Shirt Dress', 'StyleForward Inc.', 'BSD', '1X', 1, '94.99', 'fulfilled'),
    ],
    subtotalPrice: '94.99', totalTax: '14.25', totalPrice: '109.24', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-3'] },
    billingAddress:  { ...BILLING['cust-3'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-05T09:47:00Z', message: 'Order placed' },
      { at: '2026-04-05T10:00:00Z', message: 'Payment confirmed' },
      { at: '2026-04-05T11:00:00Z', message: 'Order forwarded to StyleForward Inc. (ref: NB-1003-SUP3)' },
      { at: '2026-04-06T08:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1004', name: '#1004', orderNumber: 1004, createdAt: '2026-04-05T16:12:00Z',
    customerId: 'cust-4', customerName: 'Jennifer Walsh', customerEmail: 'j.walsh@email.com', phone: '+14035550193',
    lineItems: [
      li('10041', 7, 2, 'Tailored Blazer',     'True North Apparel', 'TBL', '2X', 1, '119.99', null),
      li('10042', 8, 2, 'Ponte Pencil Skirt',  'True North Apparel', 'PPS', '2X', 1, '74.99',  null),
    ],
    subtotalPrice: '194.98', totalTax: '25.35', totalPrice: '220.33', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-4'] },
    billingAddress:  { ...BILLING['cust-4'] },
    note: 'Prefers express shipping if available.', tags: 'vip',
    timeline: [
      { at: '2026-04-05T16:12:00Z', message: 'Order placed' },
      { at: '2026-04-05T16:30:00Z', message: 'Payment confirmed' },
    ],
  },
  {
    id: 'order-1005', name: '#1005', orderNumber: 1005, createdAt: '2026-04-04T13:58:00Z',
    customerId: 'cust-5', customerName: 'Aisha Okonkwo', customerEmail: 'aisha.ok@email.com', phone: '+16135550467',
    lineItems: [
      li('10051', 6, 3, 'Relaxed Linen Pants', 'Maple Textiles Co.', 'RLP', '3X', 1, '69.99', 'fulfilled'),
    ],
    subtotalPrice: '69.99', totalTax: '9.10', totalPrice: '79.09', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-5'] },
    billingAddress:  { ...BILLING['cust-5'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-04T13:58:00Z', message: 'Order placed' },
      { at: '2026-04-04T14:10:00Z', message: 'Payment confirmed' },
      { at: '2026-04-05T10:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1006', name: '#1006', orderNumber: 1006, createdAt: '2026-04-04T08:30:00Z',
    customerId: 'cust-6', customerName: 'Linda Bergeron', customerEmail: 'l.bergeron@email.com', phone: '+14185550852',
    lineItems: [
      li('10061', 2, 2, 'Garden Print Blouse', 'Maple Textiles Co.', 'GPB', '2X', 1, '54.99', 'fulfilled'),
      li('10062', 3, 2, 'Midi Skirt in Sage',  'Maple Textiles Co.', 'MSS', '2X', 1, '64.99', 'fulfilled'),
    ],
    subtotalPrice: '119.98', totalTax: '15.60', totalPrice: '135.58', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-6'] },
    billingAddress:  { ...BILLING['cust-6'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-04T08:30:00Z', message: 'Order placed' },
      { at: '2026-04-04T08:45:00Z', message: 'Payment confirmed' },
      { at: '2026-04-05T09:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1007', name: '#1007', orderNumber: 1007, createdAt: '2026-04-03T20:14:00Z',
    customerId: 'cust-7', customerName: 'Fatima Al-Hassan', customerEmail: 'f.alhassan@email.com', phone: '+17805550629',
    lineItems: [
      li('10071', 7, 1, 'Tailored Blazer', 'True North Apparel', 'TBL', '1X', 1, '119.99', null),
    ],
    subtotalPrice: '119.99', totalTax: '15.60', totalPrice: '135.59', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-7'] },
    billingAddress:  { ...BILLING['cust-7'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-03T20:14:00Z', message: 'Order placed' },
      { at: '2026-04-03T20:30:00Z', message: 'Payment confirmed' },
    ],
  },
  {
    id: 'order-1008', name: '#1008', orderNumber: 1008, createdAt: '2026-04-03T11:22:00Z',
    customerId: 'cust-8', customerName: 'Wendy Kowalski', customerEmail: 'wendy.k@email.com', phone: '+12045550738',
    lineItems: [
      li('10081', 10, 1, 'Cozy Knit Sweater',    'True North Apparel', 'CKS', '1X', 1, '69.99', 'fulfilled'),
      li('10082', 11, 2, 'French Terry Joggers',  'Maple Textiles Co.', 'FTJ', '2X', 1, '59.99', 'fulfilled'),
    ],
    subtotalPrice: '129.98', totalTax: '16.90', totalPrice: '146.88', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-8'] },
    billingAddress:  { ...BILLING['cust-8'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-03T11:22:00Z', message: 'Order placed' },
      { at: '2026-04-03T11:35:00Z', message: 'Payment confirmed' },
      { at: '2026-04-03T14:00:00Z', message: 'Order forwarded to True North Apparel (ref: NB-1008-SUP2)' },
      { at: '2026-04-03T14:00:00Z', message: 'Order forwarded to Maple Textiles Co. (ref: NB-1008-SUP1)' },
      { at: '2026-04-04T10:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1009', name: '#1009', orderNumber: 1009, createdAt: '2026-04-02T15:03:00Z',
    customerId: 'cust-9', customerName: 'Diane Leblanc', customerEmail: 'd.leblanc@email.com', phone: '+19025550514',
    lineItems: [
      li('10091', 5, 2, 'High-Waist Straight Jeans', 'True North Apparel', 'HWSJ', '2X', 1, '89.99', 'fulfilled'),
    ],
    subtotalPrice: '89.99', totalTax: '11.70', totalPrice: '101.69', currencyCode: 'CAD',
    fulfillmentStatus: 'fulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-9'] },
    billingAddress:  { ...BILLING['cust-9'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-02T15:03:00Z', message: 'Order placed' },
      { at: '2026-04-02T15:20:00Z', message: 'Payment confirmed' },
      { at: '2026-04-03T09:00:00Z', message: 'Order fulfilled and shipped' },
    ],
  },
  {
    id: 'order-1010', name: '#1010', orderNumber: 1010, createdAt: '2026-04-02T09:45:00Z',
    customerId: 'cust-10', customerName: 'Rachel Thompson', customerEmail: 'r.thompson@email.com', phone: '+19055550286',
    lineItems: [
      li('10101', 12, 3, 'Oversized Hoodie',   'StyleForward Inc.',  'OSH', '3X', 1, '79.99', null),
      li('10102', 4,  3, 'Classic Jersey Tee', 'Maple Textiles Co.', 'CJT', '3X', 1, '34.99', null),
    ],
    subtotalPrice: '114.98', totalTax: '14.95', totalPrice: '129.93', currencyCode: 'CAD',
    fulfillmentStatus: 'unfulfilled', financialStatus: 'paid',
    shippingAddress: { ...BILLING['cust-10'] },
    billingAddress:  { ...BILLING['cust-10'] },
    note: '', tags: '',
    timeline: [
      { at: '2026-04-02T09:45:00Z', message: 'Order placed' },
      { at: '2026-04-02T10:00:00Z', message: 'Payment confirmed' },
    ],
  },
]

// Fulfillments — mirrors Shopify Fulfillment object
// Only for fulfilled orders
const FULFILLMENTS = [
  {
    id: 'ful-1001-1', orderId: 'order-1001', name: '#1001.1',
    status: 'success', shipmentStatus: 'delivered', service: 'canada_post',
    trackingNumber: 'CP123456789CA', trackingNumbers: ['CP123456789CA'],
    trackingCompany: 'Canada Post',
    trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP123456789CA',
    trackingUrls: ['https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP123456789CA'],
    lineItems: [li('10011', 1, 2, 'Floral Wrap Dress', 'Maple Textiles Co.', 'FWD', '2X', 1, '79.99', 'fulfilled')],
    createdAt: '2026-04-07T09:15:00Z',
  },
  {
    id: 'ful-1003-1', orderId: 'order-1003', name: '#1003.1',
    status: 'success', shipmentStatus: 'delivered', service: 'canada_post',
    trackingNumber: 'CP234567890CA', trackingNumbers: ['CP234567890CA'],
    trackingCompany: 'Canada Post',
    trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP234567890CA',
    trackingUrls: ['https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP234567890CA'],
    lineItems: [li('10031', 9, 1, 'Button-Down Shirt Dress', 'StyleForward Inc.', 'BSD', '1X', 1, '94.99', 'fulfilled')],
    createdAt: '2026-04-06T08:00:00Z',
  },
  {
    id: 'ful-1005-1', orderId: 'order-1005', name: '#1005.1',
    status: 'success', shipmentStatus: 'in_transit', service: 'canada_post',
    trackingNumber: 'CP345678901CA', trackingNumbers: ['CP345678901CA'],
    trackingCompany: 'Canada Post',
    trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP345678901CA',
    trackingUrls: ['https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP345678901CA'],
    lineItems: [li('10051', 6, 3, 'Relaxed Linen Pants', 'Maple Textiles Co.', 'RLP', '3X', 1, '69.99', 'fulfilled')],
    createdAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'ful-1006-1', orderId: 'order-1006', name: '#1006.1',
    status: 'success', shipmentStatus: 'delivered', service: 'canada_post',
    trackingNumber: 'CP456789012CA', trackingNumbers: ['CP456789012CA'],
    trackingCompany: 'Canada Post',
    trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP456789012CA',
    trackingUrls: ['https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP456789012CA'],
    lineItems: [
      li('10061', 2, 2, 'Garden Print Blouse', 'Maple Textiles Co.', 'GPB', '2X', 1, '54.99', 'fulfilled'),
      li('10062', 3, 2, 'Midi Skirt in Sage',  'Maple Textiles Co.', 'MSS', '2X', 1, '64.99', 'fulfilled'),
    ],
    createdAt: '2026-04-05T09:00:00Z',
  },
  {
    id: 'ful-1008-1', orderId: 'order-1008', name: '#1008.1',
    status: 'success', shipmentStatus: 'delivered', service: 'canada_post',
    trackingNumber: 'CP987654321CA', trackingNumbers: ['CP987654321CA'],
    trackingCompany: 'Canada Post',
    trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP987654321CA',
    trackingUrls: ['https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP987654321CA'],
    lineItems: [
      li('10081', 10, 1, 'Cozy Knit Sweater',   'True North Apparel', 'CKS', '1X', 1, '69.99', 'fulfilled'),
      li('10082', 11, 2, 'French Terry Joggers', 'Maple Textiles Co.', 'FTJ', '2X', 1, '59.99', 'fulfilled'),
    ],
    createdAt: '2026-04-04T10:00:00Z',
  },
  {
    id: 'ful-1009-1', orderId: 'order-1009', name: '#1009.1',
    status: 'success', shipmentStatus: 'delivered', service: 'canada_post',
    trackingNumber: 'CP876543210CA', trackingNumbers: ['CP876543210CA'],
    trackingCompany: 'Canada Post',
    trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP876543210CA',
    trackingUrls: ['https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=CP876543210CA'],
    lineItems: [li('10091', 5, 2, 'High-Waist Straight Jeans', 'True North Apparel', 'HWSJ', '2X', 1, '89.99', 'fulfilled')],
    createdAt: '2026-04-03T09:00:00Z',
  },
]

// Inventory item IDs mirror ProductVariant.inventory_item_id from the PRODUCTS/makeVariants above
// Format: gid://shopify/InventoryItem/{productNumId}{variantIdx}  (variantIdx 1-4)
const INVENTORY = [
  { id: 'inv-1',  inventoryItemId: 'gid://shopify/InventoryItem/41', locationId: 'primary', productTitle: 'Classic Jersey Tee',        variantTitle: '1X', available: 20 },
  { id: 'inv-2',  inventoryItemId: 'gid://shopify/InventoryItem/42', locationId: 'primary', productTitle: 'Classic Jersey Tee',        variantTitle: '2X', available: 18 },
  { id: 'inv-3',  inventoryItemId: 'gid://shopify/InventoryItem/43', locationId: 'primary', productTitle: 'Classic Jersey Tee',        variantTitle: '3X', available: 12 },
  { id: 'inv-4',  inventoryItemId: 'gid://shopify/InventoryItem/44', locationId: 'primary', productTitle: 'Classic Jersey Tee',        variantTitle: '4X', available: 8  },
  { id: 'inv-5',  inventoryItemId: 'gid://shopify/InventoryItem/11', locationId: 'primary', productTitle: 'Floral Wrap Dress',         variantTitle: '1X', available: 12 },
  { id: 'inv-6',  inventoryItemId: 'gid://shopify/InventoryItem/12', locationId: 'primary', productTitle: 'Floral Wrap Dress',         variantTitle: '2X', available: 8  },
  { id: 'inv-7',  inventoryItemId: 'gid://shopify/InventoryItem/13', locationId: 'primary', productTitle: 'Floral Wrap Dress',         variantTitle: '3X', available: 4  },
  { id: 'inv-8',  inventoryItemId: 'gid://shopify/InventoryItem/14', locationId: 'primary', productTitle: 'Floral Wrap Dress',         variantTitle: '4X', available: 2  },
  { id: 'inv-9',  inventoryItemId: 'gid://shopify/InventoryItem/21', locationId: 'primary', productTitle: 'Garden Print Blouse',       variantTitle: '1X', available: 15 },
  { id: 'inv-10', inventoryItemId: 'gid://shopify/InventoryItem/22', locationId: 'primary', productTitle: 'Garden Print Blouse',       variantTitle: '2X', available: 10 },
  { id: 'inv-11', inventoryItemId: 'gid://shopify/InventoryItem/23', locationId: 'primary', productTitle: 'Garden Print Blouse',       variantTitle: '3X', available: 6  },
  { id: 'inv-12', inventoryItemId: 'gid://shopify/InventoryItem/24', locationId: 'primary', productTitle: 'Garden Print Blouse',       variantTitle: '4X', available: 3  },
  { id: 'inv-13', inventoryItemId: 'gid://shopify/InventoryItem/51', locationId: 'primary', productTitle: 'High-Waist Straight Jeans', variantTitle: '1X', available: 10 },
  { id: 'inv-14', inventoryItemId: 'gid://shopify/InventoryItem/52', locationId: 'primary', productTitle: 'High-Waist Straight Jeans', variantTitle: '2X', available: 14 },
  { id: 'inv-15', inventoryItemId: 'gid://shopify/InventoryItem/53', locationId: 'primary', productTitle: 'High-Waist Straight Jeans', variantTitle: '3X', available: 9  },
  { id: 'inv-16', inventoryItemId: 'gid://shopify/InventoryItem/54', locationId: 'primary', productTitle: 'High-Waist Straight Jeans', variantTitle: '4X', available: 5  },
  { id: 'inv-17', inventoryItemId: 'gid://shopify/InventoryItem/71', locationId: 'primary', productTitle: 'Tailored Blazer',           variantTitle: '1X', available: 7  },
  { id: 'inv-18', inventoryItemId: 'gid://shopify/InventoryItem/72', locationId: 'primary', productTitle: 'Tailored Blazer',           variantTitle: '2X', available: 5  },
  { id: 'inv-19', inventoryItemId: 'gid://shopify/InventoryItem/73', locationId: 'primary', productTitle: 'Tailored Blazer',           variantTitle: '3X', available: 3  },
  { id: 'inv-20', inventoryItemId: 'gid://shopify/InventoryItem/74', locationId: 'primary', productTitle: 'Tailored Blazer',           variantTitle: '4X', available: 2  },
  { id: 'inv-21', inventoryItemId: 'gid://shopify/InventoryItem/121', locationId: 'primary', productTitle: 'Oversized Hoodie',         variantTitle: '1X', available: 16 },
  { id: 'inv-22', inventoryItemId: 'gid://shopify/InventoryItem/122', locationId: 'primary', productTitle: 'Oversized Hoodie',         variantTitle: '2X', available: 11 },
  { id: 'inv-23', inventoryItemId: 'gid://shopify/InventoryItem/123', locationId: 'primary', productTitle: 'Oversized Hoodie',         variantTitle: '3X', available: 6  },
  { id: 'inv-24', inventoryItemId: 'gid://shopify/InventoryItem/124', locationId: 'primary', productTitle: 'Oversized Hoodie',         variantTitle: '4X', available: 2  },
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

const SUPPLIER_ORDERS = [
  {
    // PO sent to Maple Textiles for order #1001 — shipped with tracking
    id: 'so-1001-sup1', orderId: 'order-1001', orderName: '#1001',
    supplierId: 'sup-1', supplierName: 'Maple Textiles Co.',
    items: [
      { sku: 'NB-FWD-2X', title: 'Floral Wrap Dress', variantTitle: '2X', quantity: 1, unitPrice: '79.99', lineTotal: '79.99' },
    ],
    shippingAddress: {
      name: 'Sarah Mitchell',
      address1: '847 Spadina Ave',
      address2: 'Apt 4B',
      city: 'Toronto',
      province: 'ON',
      zip: 'M5S 2J5',
      country: 'Canada',
      phone: '+1-416-555-0312',
    },
    status: 'shipped',
    reference: 'NB-1001-SUP1',
    notes: 'Please include Northern Blue packing slip. Standard Canada Post shipping.',
    trackingNumber: 'CP123456789CA',
    trackingCompany: 'Canada Post',
    sentAt: '2026-04-06T17:00:00Z',
  },
  {
    // PO sent to StyleForward for order #1003 — confirmed, not yet dispatched
    id: 'so-1003-sup3', orderId: 'order-1003', orderName: '#1003',
    supplierId: 'sup-3', supplierName: 'StyleForward Inc.',
    items: [
      { sku: 'SF-BSSD-1X', title: 'Button-Down Shirt Dress', variantTitle: '1X', quantity: 1, unitPrice: '94.99', lineTotal: '94.99' },
    ],
    shippingAddress: {
      name: 'Marie Tremblay',
      address1: '3842 Rue Sherbrooke Ouest',
      address2: null,
      city: 'Montréal',
      province: 'QC',
      zip: 'H3Z 1E9',
      country: 'Canada',
      phone: '+1-514-555-0274',
    },
    status: 'confirmed',
    reference: 'NB-1003-SUP3',
    notes: 'Ship via Canada Post. Customer is in QC — duties not applicable (domestic). Supplier reference: SF-PO-88421.',
    trackingNumber: null,
    trackingCompany: null,
    sentAt: '2026-04-05T11:00:00Z',
  },
  {
    // PO sent to True North for order #1008 — sent, awaiting confirmation
    id: 'so-1008-sup2', orderId: 'order-1008', orderName: '#1008',
    supplierId: 'sup-2', supplierName: 'True North Apparel',
    items: [
      { sku: 'TNA-CKS-1X', title: 'Cozy Knit Sweater', variantTitle: '1X', quantity: 1, unitPrice: '69.99', lineTotal: '69.99' },
    ],
    shippingAddress: {
      name: 'Wendy Kowalski',
      address1: '156 River Ave',
      address2: 'Unit 12',
      city: 'Winnipeg',
      province: 'MB',
      zip: 'R3L 0A3',
      country: 'Canada',
      phone: '+1-204-555-0738',
    },
    status: 'sent',
    reference: 'NB-1008-SUP2',
    notes: '',
    trackingNumber: null,
    trackingCompany: null,
    sentAt: '2026-04-03T14:00:00Z',
  },
  {
    // PO sent to Maple Textiles for order #1008 — shipped with tracking
    id: 'so-1008-sup1', orderId: 'order-1008', orderName: '#1008',
    supplierId: 'sup-1', supplierName: 'Maple Textiles Co.',
    items: [
      { sku: 'NB-FTJ-2X', title: 'French Terry Joggers', variantTitle: '2X', quantity: 1, unitPrice: '59.99', lineTotal: '59.99' },
    ],
    shippingAddress: {
      name: 'Wendy Kowalski',
      address1: '156 River Ave',
      address2: 'Unit 12',
      city: 'Winnipeg',
      province: 'MB',
      zip: 'R3L 0A3',
      country: 'Canada',
      phone: '+1-204-555-0738',
    },
    status: 'shipped',
    reference: 'NB-1008-SUP1',
    notes: 'Split shipment — separate parcel from NB-1008-SUP2.',
    trackingNumber: 'CP987654321CA',
    trackingCompany: 'Canada Post',
    sentAt: '2026-04-03T14:00:00Z',
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
  const conn = await pool.getConnection()
  try {
    // Existing seed order inserts products before suppliers; disable FK checks
    // for the duration of the transaction so the seed isn't sensitive to order.
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    await conn.beginTransaction()

    console.log('Seeding collections...')
    for (const c of COLLECTIONS) {
      await conn.query(
        `INSERT INTO collections (id, title, handle, description, image)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title), handle = VALUES(handle),
           description = VALUES(description), image = VALUES(image)`,
        [c.id, c.title, c.handle, c.description, c.image]
      )
    }

    console.log('Seeding products...')
    for (const p of PRODUCTS) {
      const numId = p.id.replace('gid://shopify/Product/', '')
      await conn.query(
        `INSERT INTO products
           (id, title, handle, description, vendor, product_type, status, tags,
            collection_handle, supplier_id, price_min, currency_code,
            images, options, variants, published_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title), handle = VALUES(handle),
           description = VALUES(description), vendor = VALUES(vendor),
           product_type = VALUES(product_type), status = VALUES(status),
           tags = VALUES(tags), collection_handle = VALUES(collection_handle),
           supplier_id = VALUES(supplier_id),
           price_min = VALUES(price_min), options = VALUES(options), variants = VALUES(variants)`,
        [
          p.id, p.title, p.handle, p.description, p.vendor, p.productType, 'active', p.tags,
          p.collectionHandle, p.supplierId,
          p.price, 'CAD', '[]',
          JSON.stringify([SIZE_OPTION]),
          JSON.stringify(makeVariants(numId, p.skuPrefix, p.price)),
          dt('2026-01-15T00:00:00Z'),
        ]
      )
    }

    console.log('Seeding customers...')
    for (const c of CUSTOMERS) {
      await conn.query(
        `INSERT INTO customers
           (id, first_name, last_name, email, phone, state, note, tags,
            tax_exempt, verified_email, city, province,
            orders_count, total_spent, last_order_id, last_order_name)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           first_name = VALUES(first_name), last_name = VALUES(last_name),
           email = VALUES(email), phone = VALUES(phone), state = VALUES(state),
           note = VALUES(note), tags = VALUES(tags),
           tax_exempt = VALUES(tax_exempt), verified_email = VALUES(verified_email),
           city = VALUES(city), province = VALUES(province),
           orders_count = VALUES(orders_count), total_spent = VALUES(total_spent),
           last_order_id = VALUES(last_order_id), last_order_name = VALUES(last_order_name)`,
        [
          c.id, c.firstName, c.lastName, c.email, c.phone, c.state, c.note, c.tags,
          c.taxExempt ? 1 : 0, c.verifiedEmail ? 1 : 0, c.city, c.province,
          c.ordersCount, c.totalSpent, c.lastOrderId, c.lastOrderName,
        ]
      )
    }

    console.log('Seeding orders...')
    for (const o of ORDERS) {
      await conn.query(
        `INSERT INTO orders
           (id, name, order_number, customer_id, customer_name, customer_email, phone,
            line_items, subtotal_price, total_tax, total_price, taxes_included, currency_code,
            fulfillment_status, financial_status,
            shipping_address, billing_address, timeline, note, tags, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), order_number = VALUES(order_number),
           phone = VALUES(phone), line_items = VALUES(line_items),
           subtotal_price = VALUES(subtotal_price), total_tax = VALUES(total_tax),
           total_price = VALUES(total_price),
           fulfillment_status = VALUES(fulfillment_status),
           financial_status = VALUES(financial_status),
           shipping_address = VALUES(shipping_address),
           billing_address = VALUES(billing_address),
           timeline = VALUES(timeline), note = VALUES(note), tags = VALUES(tags)`,
        [
          o.id, o.name, o.orderNumber, o.customerId, o.customerName, o.customerEmail, o.phone,
          JSON.stringify(o.lineItems), o.subtotalPrice, o.totalTax, o.totalPrice, 0, o.currencyCode,
          o.fulfillmentStatus, o.financialStatus,
          JSON.stringify(o.shippingAddress), JSON.stringify(o.billingAddress),
          JSON.stringify(o.timeline), o.note, o.tags, dt(o.createdAt),
        ]
      )
    }

    console.log('Seeding fulfillments...')
    for (const f of FULFILLMENTS) {
      await conn.query(
        `INSERT INTO fulfillments
           (id, order_id, name, status, shipment_status, service,
            tracking_number, tracking_numbers, tracking_company, tracking_url, tracking_urls,
            line_items, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status), shipment_status = VALUES(shipment_status),
           tracking_number = VALUES(tracking_number),
           tracking_numbers = VALUES(tracking_numbers),
           tracking_company = VALUES(tracking_company),
           tracking_url = VALUES(tracking_url),
           tracking_urls = VALUES(tracking_urls)`,
        [
          f.id, f.orderId, f.name, f.status, f.shipmentStatus, f.service,
          f.trackingNumber, JSON.stringify(f.trackingNumbers),
          f.trackingCompany, f.trackingUrl, JSON.stringify(f.trackingUrls),
          JSON.stringify(f.lineItems), dt(f.createdAt),
        ]
      )
    }

    console.log('Seeding inventory...')
    for (const inv of INVENTORY) {
      await conn.query(
        `INSERT INTO inventory (id, inventory_item_id, location_id, product_title, variant_title, available)
         VALUES (?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           inventory_item_id = VALUES(inventory_item_id),
           location_id = VALUES(location_id),
           product_title = VALUES(product_title),
           variant_title = VALUES(variant_title),
           available = VALUES(available)`,
        [inv.id, inv.inventoryItemId, inv.locationId, inv.productTitle, inv.variantTitle, inv.available]
      )
    }

    console.log('Seeding suppliers...')
    for (const s of SUPPLIERS) {
      await conn.query(
        `INSERT INTO suppliers
           (id, name, contact_name, contact_email, phone, country,
            lead_time_days, integration_type, api_endpoint, api_key,
            active, notes, product_count)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), contact_name = VALUES(contact_name),
           contact_email = VALUES(contact_email), phone = VALUES(phone),
           country = VALUES(country), lead_time_days = VALUES(lead_time_days),
           integration_type = VALUES(integration_type), active = VALUES(active),
           notes = VALUES(notes), product_count = VALUES(product_count)`,
        [
          s.id, s.name, s.contactName, s.contactEmail, s.phone, s.country,
          s.leadTimeDays, s.integrationType, s.apiEndpoint, s.apiKey,
          s.active ? 1 : 0, s.notes, s.productCount,
        ]
      )
    }

    console.log('Seeding discounts...')
    for (const d of DISCOUNTS) {
      await conn.query(
        `INSERT INTO discounts
           (id, code, type, value, min_order_amount, usage_limit,
            usage_count, starts_at, expires_at, active, summary)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           code = VALUES(code), type = VALUES(type), value = VALUES(value),
           min_order_amount = VALUES(min_order_amount), usage_limit = VALUES(usage_limit),
           usage_count = VALUES(usage_count), starts_at = VALUES(starts_at),
           expires_at = VALUES(expires_at), active = VALUES(active), summary = VALUES(summary)`,
        [
          d.id, d.code, d.type, d.value, d.minOrderAmount, d.usageLimit,
          d.usageCount, d.startsAt || null, d.expiresAt || null, d.active ? 1 : 0, d.summary,
        ]
      )
    }

    console.log('Seeding returns...')
    for (const r of RETURNS) {
      await conn.query(
        `INSERT INTO \`returns\`
           (id, order_id, order_name, customer_id, customer_name, customer_email,
            requested_at, reason, items, refund_amount, currency_code, status, timeline, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status), timeline = VALUES(timeline), notes = VALUES(notes)`,
        [
          r.id, r.orderId, r.orderName, r.customerId, r.customerName, r.customerEmail,
          dt(r.requestedAt), r.reason, JSON.stringify(r.items),
          r.refundAmount, r.currencyCode, r.status,
          JSON.stringify(r.timeline), r.notes,
        ]
      )
    }

    console.log('Seeding supplier orders...')
    for (const so of SUPPLIER_ORDERS) {
      await conn.query(
        `INSERT INTO supplier_orders
           (id, order_id, order_name, supplier_id, supplier_name,
            items, shipping_address, status, reference, notes,
            tracking_number, tracking_company, sent_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status), notes = VALUES(notes),
           tracking_number = VALUES(tracking_number),
           tracking_company = VALUES(tracking_company)`,
        [
          so.id, so.orderId, so.orderName, so.supplierId, so.supplierName,
          JSON.stringify(so.items), JSON.stringify(so.shippingAddress),
          so.status, so.reference, so.notes,
          so.trackingNumber, so.trackingCompany, dt(so.sentAt),
        ]
      )
    }

    console.log('Seeding revenue...')
    for (const rev of REVENUE) {
      await conn.query(
        `INSERT INTO revenue (date, amount) VALUES (?,?)
         ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
        [rev.date, rev.amount]
      )
    }

    await conn.commit()
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log('✓ Seed complete')
  } catch (err) {
    await conn.rollback()
    await conn.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {})
    console.error('Seed failed:', err.message)
    process.exit(1)
  } finally {
    conn.release()
    await pool.end()
  }
}

seed()
