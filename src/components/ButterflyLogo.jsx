import { useId } from 'react'

const ButterflyLogo = ({ size = 80, className = '' }) => {
  const id = useId()
  const lgL = `${id}-wgL`
  const lgR = `${id}-wgR`

  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={Math.round(size * (100 / 120))}
      className={className}
      aria-label="Northern Blue butterfly logo"
      role="img"
    >
      <defs>
        <linearGradient id={lgL} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A90D9" />
          <stop offset="100%" stopColor="#B8D9F0" />
        </linearGradient>
        <linearGradient id={lgR} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A90D9" />
          <stop offset="100%" stopColor="#B8D9F0" />
        </linearGradient>
      </defs>
      {/* Left upper wing */}
      <polygon points="58,42 8,8 10,52 44,60" fill={`url(#${lgL})`} opacity="0.9" />
      {/* Right upper wing */}
      <polygon points="62,42 112,8 110,52 76,60" fill={`url(#${lgR})`} opacity="0.9" />
      {/* Left lower wing */}
      <polygon points="56,64 14,62 20,92 55,74" fill={`url(#${lgL})`} opacity="0.7" />
      {/* Right lower wing */}
      <polygon points="64,64 106,62 100,92 65,74" fill={`url(#${lgR})`} opacity="0.7" />
      {/* Body */}
      <ellipse cx="60" cy="55" rx="3" ry="18" fill="#1B2F4E" />
    </svg>
  )
}

export default ButterflyLogo
