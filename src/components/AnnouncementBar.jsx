import { useState } from 'react'

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-nb-navy text-white text-sm py-2.5 px-6 flex items-center justify-center relative">
      <p className="text-white/90 tracking-wide text-center">
        Free shipping on orders over $75&nbsp;&nbsp;·&nbsp;&nbsp;
        <span className="underline underline-offset-2 cursor-pointer">Shop now →</span>
      </p>
      <button
        aria-label="dismiss announcement"
        className="absolute right-4 text-white/50 hover:text-white transition-colors text-xl leading-none"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  )
}

export default AnnouncementBar
