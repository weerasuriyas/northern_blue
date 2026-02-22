import { render, screen } from '@testing-library/react'
import App from '../App'

test('renders all main sections', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /northern blue/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument()
})
