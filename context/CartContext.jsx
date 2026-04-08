'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  stubCreateCart,
  stubAddLine,
  stubUpdateLine,
  stubRemoveLine,
} from '@/lib/cart.js'

const CartContext = createContext(null)

const STORAGE_KEY = 'nb-cart'

function loadCart() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // storage unavailable — continue without persistence
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => stubCreateCart())
  const [isOpen, setIsOpen] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadCart()
    if (stored) setCart(stored)
  }, [])

  // Persist whenever cart changes
  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const addItem = useCallback((variantId, quantity, merchandise) => {
    setCart(prev => stubAddLine(prev, { variantId, quantity, merchandise }))
    setIsOpen(true)
  }, [])

  const updateItem = useCallback((lineId, quantity) => {
    setCart(prev => stubUpdateLine(prev, lineId, quantity))
  }, [])

  const removeItem = useCallback((lineId) => {
    setCart(prev => stubRemoveLine(prev, lineId))
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const itemCount = cart.lines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, isOpen, itemCount, addItem, updateItem, removeItem, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be used within CartProvider')
  return ctx
}
