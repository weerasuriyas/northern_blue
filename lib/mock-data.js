// Mock data in Shopify Storefront API shape.
// Swap lib/shopify.js to real GraphQL calls when tokens are ready.

const SIZES = ['1X', '2X', '3X', '4X']

function makeVariants(basePrice) {
  return {
    edges: SIZES.map((size, i) => ({
      node: {
        id: `gid://shopify/ProductVariant/stub-${basePrice}-${i}`,
        title: size,
        availableForSale: true,
        price: { amount: basePrice, currencyCode: 'CAD' },
      },
    })),
  }
}

export const MOCK_PRODUCTS = [
  // Spring Collection
  {
    id: 'gid://shopify/Product/1',
    title: 'Floral Wrap Dress',
    handle: 'floral-wrap-dress',
    description: 'A breezy wrap dress in a soft floral print. Flattering tie waist, flutter sleeves, midi length. Perfect for spring outings.',
    collectionHandle: 'spring-collection',
    priceRange: { minVariantPrice: { amount: '79.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('79.99'),
  },
  {
    id: 'gid://shopify/Product/2',
    title: 'Garden Print Blouse',
    handle: 'garden-print-blouse',
    description: 'Light and airy blouse with a botanical print. Relaxed fit, V-neckline, 3/4 sleeves. Pairs beautifully with jeans or trousers.',
    collectionHandle: 'spring-collection',
    priceRange: { minVariantPrice: { amount: '54.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('54.99'),
  },
  {
    id: 'gid://shopify/Product/3',
    title: 'Midi Skirt in Sage',
    handle: 'midi-skirt-sage',
    description: 'Flowy midi skirt in a calming sage green. Elastic waistband for all-day comfort. Versatile enough for work or weekend.',
    collectionHandle: 'spring-collection',
    priceRange: { minVariantPrice: { amount: '64.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('64.99'),
  },
  // Everyday Essentials
  {
    id: 'gid://shopify/Product/4',
    title: 'Classic Jersey Tee',
    handle: 'classic-jersey-tee',
    description: 'The tee you\'ll reach for every morning. Premium cotton jersey, relaxed fit, crew neck. Available in six colours.',
    collectionHandle: 'everyday-essentials',
    priceRange: { minVariantPrice: { amount: '34.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('34.99'),
  },
  {
    id: 'gid://shopify/Product/5',
    title: 'High-Waist Straight Jeans',
    handle: 'high-waist-straight-jeans',
    description: 'Straight-leg jeans cut to celebrate curves. High rise, full seat, and thigh with a straight leg from knee to hem. Our most-loved fit.',
    collectionHandle: 'everyday-essentials',
    priceRange: { minVariantPrice: { amount: '89.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('89.99'),
  },
  {
    id: 'gid://shopify/Product/6',
    title: 'Relaxed Linen Pants',
    handle: 'relaxed-linen-pants',
    description: 'Breathable linen trousers with an easy relaxed fit. Elastic waist, side pockets, tapered leg. A summer wardrobe staple.',
    collectionHandle: 'everyday-essentials',
    priceRange: { minVariantPrice: { amount: '69.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('69.99'),
  },
  // Workwear Edit
  {
    id: 'gid://shopify/Product/7',
    title: 'Tailored Blazer',
    handle: 'tailored-blazer',
    description: 'A structured blazer that means business. Clean lines, button closure, interior pockets. Wear open over a tee or buttoned for meetings.',
    collectionHandle: 'workwear-edit',
    priceRange: { minVariantPrice: { amount: '119.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('119.99'),
  },
  {
    id: 'gid://shopify/Product/8',
    title: 'Ponte Pencil Skirt',
    handle: 'ponte-pencil-skirt',
    description: 'A polished pencil skirt in smooth ponte fabric. Invisible back zip, knee length, slight stretch for comfort throughout the day.',
    collectionHandle: 'workwear-edit',
    priceRange: { minVariantPrice: { amount: '74.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('74.99'),
  },
  {
    id: 'gid://shopify/Product/9',
    title: 'Button-Down Shirt Dress',
    handle: 'button-down-shirt-dress',
    description: 'A crisp shirt dress that works as hard as you do. Full-length buttons, belt loops with removable belt, chest pockets.',
    collectionHandle: 'workwear-edit',
    priceRange: { minVariantPrice: { amount: '94.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('94.99'),
  },
  // Weekend Casual
  {
    id: 'gid://shopify/Product/10',
    title: 'Cozy Knit Sweater',
    handle: 'cozy-knit-sweater',
    description: 'Chunky knit pullover in a soft wool-blend. Relaxed fit, ribbed cuffs and hem, cosy without feeling bulky.',
    collectionHandle: 'weekend-casual',
    priceRange: { minVariantPrice: { amount: '69.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('69.99'),
  },
  {
    id: 'gid://shopify/Product/11',
    title: 'French Terry Joggers',
    handle: 'french-terry-joggers',
    description: 'Elevated joggers in cozy French terry. Elasticated waist with drawstring, tapered leg, deep side pockets.',
    collectionHandle: 'weekend-casual',
    priceRange: { minVariantPrice: { amount: '59.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('59.99'),
  },
  {
    id: 'gid://shopify/Product/12',
    title: 'Oversized Hoodie',
    handle: 'oversized-hoodie',
    description: 'The ultimate weekend hoodie. Brushed fleece interior, kangaroo pocket, dropped shoulders for a relaxed oversized feel.',
    collectionHandle: 'weekend-casual',
    priceRange: { minVariantPrice: { amount: '79.99', currencyCode: 'CAD' } },
    images: { edges: [] },
    variants: makeVariants('79.99'),
  },
]

export const MOCK_COLLECTIONS = [
  {
    id: 'gid://shopify/Collection/1',
    title: 'Spring Collection',
    handle: 'spring-collection',
    description: 'Fresh florals, soft palettes — yours to wear.',
    image: null,
    products: { edges: MOCK_PRODUCTS.filter(p => p.collectionHandle === 'spring-collection').map(p => ({ node: p })) },
  },
  {
    id: 'gid://shopify/Collection/2',
    title: 'Everyday Essentials',
    handle: 'everyday-essentials',
    description: 'The pieces you reach for first, every morning.',
    image: null,
    products: { edges: MOCK_PRODUCTS.filter(p => p.collectionHandle === 'everyday-essentials').map(p => ({ node: p })) },
  },
  {
    id: 'gid://shopify/Collection/3',
    title: 'Workwear Edit',
    handle: 'workwear-edit',
    description: 'Polished. Powerful. Perfectly you.',
    image: null,
    products: { edges: MOCK_PRODUCTS.filter(p => p.collectionHandle === 'workwear-edit').map(p => ({ node: p })) },
  },
  {
    id: 'gid://shopify/Collection/4',
    title: 'Weekend Casual',
    handle: 'weekend-casual',
    description: 'Easy fits for the days that belong to you.',
    image: null,
    products: { edges: MOCK_PRODUCTS.filter(p => p.collectionHandle === 'weekend-casual').map(p => ({ node: p })) },
  },
]
