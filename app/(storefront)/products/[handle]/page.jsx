import { notFound } from 'next/navigation'
import { getProductByHandle } from '@/lib/shopify'
import ProductPageClient from './ProductPageClient'

export async function generateMetadata({ params }) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return {}
  return {
    title: `${product.title} — Northern Blue`,
    description: product.description ?? '',
  }
}

export default async function ProductPage({ params }) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()
  return <ProductPageClient product={product} />
}
