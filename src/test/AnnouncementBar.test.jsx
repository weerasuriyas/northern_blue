import { render, screen, fireEvent } from '@testing-library/react'
import AnnouncementBar from '../components/AnnouncementBar'

test('renders the promo message', () => {
  render(<AnnouncementBar />)
  expect(screen.getByText(/free shipping on orders over/i)).toBeInTheDocument()
})

test('renders a dismiss button', () => {
  render(<AnnouncementBar />)
  expect(screen.getByRole('button', { name: /dismiss announcement/i })).toBeInTheDocument()
})

test('hides when dismiss button is clicked', () => {
  render(<AnnouncementBar />)
  fireEvent.click(screen.getByRole('button', { name: /dismiss announcement/i }))
  expect(screen.queryByText(/free shipping/i)).not.toBeInTheDocument()
})
