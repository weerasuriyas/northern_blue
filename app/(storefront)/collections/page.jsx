import Link from 'next/link'
import { getCollections } from '@/lib/shopify'

export const metadata = {
  title: 'Collections — Northern Blue',
  description: 'Browse all Northern Blue plus-size collections.',
}

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <h1 className="font-serif text-3xl md:text-4xl text-nb-navy mb-10">All Collections</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {collections.map(collection => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group rounded-2xl overflow-hidden border border-nb-sky/40 bg-white hover:-translate-y-1 transition-transform duration-300 block"
          >
            <div className="aspect-[4/3] bg-nb-sky/20 flex items-center justify-center text-nb-blue/30 text-sm">
              {collection.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={collection.image.url} alt={collection.image.altText ?? collection.title} className="w-full h-full object-cover" />
              ) : (
                <span>image placeholder</span>
              )}
            </div>
            <div className="p-5 md:p-6">
              <h2 className="font-serif text-xl md:text-2xl text-nb-navy group-hover:text-nb-blue transition-colors">
                {collection.title}
              </h2>
              {collection.description && (
                <p className="text-nb-navy/60 text-sm mt-2 leading-relaxed">{collection.description}</p>
              )}
              <span className="inline-block mt-4 text-nb-blue text-sm font-medium">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
