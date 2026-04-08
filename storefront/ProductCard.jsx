import Link from 'next/link'
import PriceDisplay from './PriceDisplay'

export default function ProductCard({ product }) {
  const { title, handle, priceRange, images } = product
  const image = images?.edges?.[0]?.node

  return (
    <Link
      href={`/products/${handle}`}
      className="group rounded-2xl overflow-hidden border border-nb-sky/40 bg-white hover:-translate-y-1 transition-transform duration-300 block"
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-nb-sky/20 flex items-center justify-center text-nb-blue/30 text-sm overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt={image.altText ?? title} className="w-full h-full object-cover" />
        ) : (
          <span className="tracking-wide">image placeholder</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-nb-navy group-hover:text-nb-blue transition-colors text-sm leading-snug">
          {title}
        </h3>
        <div className="mt-1">
          <PriceDisplay priceRange={priceRange} className="text-sm" />
        </div>
      </div>
    </Link>
  )
}
