import { notFound } from 'next/navigation'
import { getCollectionByHandle } from '@/lib/shopify'
import CollectionHeader from '@/storefront/CollectionHeader'
import ProductCard from '@/storefront/ProductCard'

export async function generateMetadata({ params }) {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)
  if (!collection) return {}
  return {
    title: `${collection.title} — Northern Blue`,
    description: collection.description,
  }
}

export default async function CollectionPage({ params }) {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)
  if (!collection) notFound()

  const products = collection.products.edges.map(e => e.node)

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <CollectionHeader collection={collection} />

      {products.length === 0 ? (
        <p className="text-nb-navy/50 text-center py-16">No products in this collection yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
