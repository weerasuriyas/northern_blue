import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '../components/Navbar'

test('renders About, Collections, and Contact nav links', () => {
  render(<Navbar />)
  expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '#about')
  expect(screen.getByRole('link', { name: /collections/i })).toHaveAttribute('href', '#collections')
  expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '#contact')
})

test('renders brand name', () => {
  render(<Navbar />)
  expect(screen.getByText(/northern blue/i)).toBeInTheDocument()
})

test('mobile menu toggles open and closed', () => {
  render(<Navbar />)
  const toggleBtn = screen.getByRole('button', { name: /toggle menu/i })
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  fireEvent.click(toggleBtn)
  expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  fireEvent.click(toggleBtn)
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
})
