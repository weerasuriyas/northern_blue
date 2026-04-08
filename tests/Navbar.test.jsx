import { render, screen, fireEvent } from '@testing-library/react'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'

function renderWithCart(ui) {
  return render(<CartProvider>{ui}</CartProvider>)
}

test('renders About, Collections, and Contact nav links', () => {
  renderWithCart(<Navbar />)
  expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/#about')
  expect(screen.getByRole('link', { name: /collections/i })).toHaveAttribute('href', '/#collections')
  expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/#contact')
})
