'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import useCart from '@/hooks/useCart'

export default function AddToCartButton({ product, selectedVariant }) {
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!selectedVariant) {
      toast.error('Please select a size first.')
      return
    }
    setLoading(true)
    try {
      addItem(selectedVariant.id, 1, {
        title: selectedVariant.title,
        price: selectedVariant.price,
        product: { title: product.title, handle: product.handle },
      })
      toast.success(`${product.title} added to cart!`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="w-full bg-nb-navy text-white font-medium py-4 rounded-lg hover:bg-nb-blue transition-colors tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Adding…' : 'Add to Cart'}
    </button>
  )
}
