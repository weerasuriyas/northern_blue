import { render, screen, fireEvent } from '@testing-library/react'
import ContactForm from '../components/ContactForm'

let originalLocation
beforeEach(() => {
  originalLocation = window.location
  delete window.location
  window.location = { href: '' }
})
afterEach(() => { window.location = originalLocation })

test('renders all form fields', () => {
  render(<ContactForm />)
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
})

test('renders the submit button', () => {
  render(<ContactForm />)
  expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
})

test('shows success message after form submit', () => {
  render(<ContactForm />)
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } })
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } })
  fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Hello' } })
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'I love your brand!' } })
  fireEvent.click(screen.getByRole('button', { name: /send message/i }))
  expect(screen.getByText(/thank you/i)).toBeInTheDocument()
})

test('has correct anchor id for smooth scroll', () => {
  const { container } = render(<ContactForm />)
  expect(container.querySelector('#contact')).toBeInTheDocument()
})

test('clicking Send Message triggers a mailto link', () => {
  render(<ContactForm />)
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } })
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } })
  fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Hello' } })
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'I love your brand!' } })
  fireEvent.click(screen.getByRole('button', { name: /send message/i }))

  expect(window.location.href).toMatch(/^mailto:admin@northernblue\.ca/)
  expect(window.location.href).toContain('subject=Hello')
  expect(window.location.href).toContain('jane%40example.com')
})

test('inner content has fade-in class', () => {
  const { container } = render(<ContactForm />)
  const fadeEl = container.querySelector('.fade-in')
  expect(fadeEl).toBeInTheDocument()
})
