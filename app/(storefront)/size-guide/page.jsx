import SizeGuideTable from '@/storefront/SizeGuideTable'

export const metadata = {
  title: 'Size Guide — Northern Blue',
  description: 'Find your perfect fit with the Northern Blue size guide.',
}

export default function SizeGuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      <h1 className="font-serif text-3xl md:text-4xl text-nb-navy mb-4">Size Guide</h1>
      <p className="text-nb-navy/60 mb-8 leading-relaxed">
        All measurements are in inches. We recommend measuring over your undergarments for the
        best fit. When between sizes, size up for a more relaxed fit.
      </p>
      <SizeGuideTable />
      <p className="mt-6 text-xs text-nb-navy/40">
        Measurements are approximate and may vary slightly by style.
      </p>
    </div>
  )
}
