'use client'

import { useState } from 'react'

export default function ProductGallery({ images, title }) {
  const [selected, setSelected] = useState(0)
  const imageList = images?.edges?.map(e => e.node) ?? []

  if (imageList.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-nb-sky/20 flex items-center justify-center text-nb-blue/30 text-sm">
        image placeholder
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-nb-sky/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageList[selected].url}
          alt={imageList[selected].altText ?? title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageList.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                selected === i ? 'border-nb-blue' : 'border-transparent'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText ?? title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
