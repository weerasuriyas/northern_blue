'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProductGallery from '@/storefront/ProductGallery'
import ProductVariantSelector from '@/storefront/ProductVariantSelector'
import AddToCartButton from '@/storefront/AddToCartButton'
import PriceDisplay from '@/storefront/PriceDisplay'

export default function ProductPageClient({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.edges?.[0]?.node ?? null
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <nav className="text-xs text-nb-navy/40 mb-8 flex items-center gap-1.5">
        <Link href="/collections" className="hover:text-nb-blue transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-nb-navy/60">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <ProductGallery images={product.images} title={product.title} />

        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-nb-navy mb-2">{product.title}</h1>
            <PriceDisplay priceRange={product.priceRange} className="text-lg" />
          </div>

          {product.description && (
            <p className="text-nb-navy/70 leading-relaxed text-sm">{product.description}</p>
          )}

          <ProductVariantSelector
            variants={product.variants}
            selected={selectedVariant}
            onChange={setSelectedVariant}
          />

          <AddToCartButton product={product} selectedVariant={selectedVariant} />

          <Link
            href="/size-guide"
            className="block text-center text-xs text-nb-blue/70 hover:text-nb-blue underline underline-offset-2 transition-colors"
          >
            View size guide
          </Link>
        </div>
      </div>
    </div>
  )
}
