export default function CollectionHeader({ collection }) {
  const { title, description, image } = collection

  return (
    <div className="mb-10">
      {image ? (
        <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-6 bg-nb-sky/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.altText ?? title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-32 md:h-48 rounded-2xl bg-nb-sky/20 mb-6 flex items-center justify-center text-nb-blue/30 text-sm">
          collection image
        </div>
      )}
      <h1 className="font-serif text-3xl md:text-4xl text-nb-navy mb-3">{title}</h1>
      {description && <p className="text-nb-navy/60 text-base leading-relaxed">{description}</p>}
    </div>
  )
}
