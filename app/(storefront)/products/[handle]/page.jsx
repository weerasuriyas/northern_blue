'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { getProductByHandle } from '@/lib/shopify'
import ProductGallery from '@/storefront/ProductGallery'
import ProductVariantSelector from '@/storefront/ProductVariantSelector'
import AddToCartButton from '@/storefront/AddToCartButton'
import PriceDisplay from '@/storefront/PriceDisplay'
import Link from 'next/link'

// NOTE: This page uses 'use client' so it can manage selected variant state.
// When wiring up Shopify, split into a server component wrapper + this client component.

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductByHandle(params.handle).then(p => {
      if (!p) { setLoading(false); return }
      setProduct(p)
      const firstVariant = p.variants?.edges?.[0]?.node ?? null
      setSelectedVariant(firstVariant)
      setLoading(false)
    })
  }, [params.handle])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-nb-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) return notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      {/* Breadcrumb */}
      <nav className="text-xs text-nb-navy/40 mb-8 flex items-center gap-1.5">
        <Link href="/collections" className="hover:text-nb-blue transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-nb-navy/60">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Details */}
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
