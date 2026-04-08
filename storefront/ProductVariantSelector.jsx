'use client'

export default function ProductVariantSelector({ variants, selected, onChange }) {
  const variantList = variants?.edges?.map(e => e.node) ?? []

  return (
    <div>
      <p className="text-sm font-medium text-nb-navy mb-2">
        Size: <span className="text-nb-blue">{selected?.title ?? '—'}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {variantList.map(variant => {
          const isSelected = selected?.id === variant.id
          const unavailable = !variant.availableForSale
          return (
            <button
              key={variant.id}
              onClick={() => !unavailable && onChange(variant)}
              disabled={unavailable}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-nb-blue bg-nb-blue text-white'
                  : unavailable
                  ? 'border-nb-sky/30 text-nb-navy/30 cursor-not-allowed line-through'
                  : 'border-nb-sky/60 text-nb-navy hover:border-nb-blue hover:text-nb-blue'
              }`}
            >
              {variant.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
