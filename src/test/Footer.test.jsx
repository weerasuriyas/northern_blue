import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

test('renders Northern Blue name in footer', () => {
  render(<Footer />)
  expect(screen.getAllByText(/northern blue/i).length).toBeGreaterThan(0)
})

test('renders current year in copyright', () => {
  render(<Footer />)
  expect(screen.getByText(new RegExp(new Date().getFullYear().toString()))).toBeInTheDocument()
})
