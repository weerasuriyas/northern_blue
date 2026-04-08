import { render, screen } from '@testing-library/react'
import { CartProvider } from '@/context/CartContext'
import HomePage from '@/app/(storefront)/page'

function renderWithCart(ui) {
  return render(<CartProvider>{ui}</CartProvider>)
}

test('renders all main sections', () => {
  renderWithCart(<HomePage />)
  expect(screen.getByRole('heading', { name: /northern blue/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument()
})
