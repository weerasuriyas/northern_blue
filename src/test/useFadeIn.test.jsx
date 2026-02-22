import { renderHook } from '@testing-library/react'
import { act } from 'react'
import useFadeIn from '../hooks/useFadeIn'

let observerInstances

beforeEach(() => {
  observerInstances = []

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
    }),
  })

  global.IntersectionObserver = class {
    constructor(cb) {
      this.cb = cb
      this.observed = []
      observerInstances.push(this)
    }
    observe(el) { this.observed.push(el) }
    unobserve(el) { this.observed = this.observed.filter((e) => e !== el) }
    disconnect() { this.observed = [] }
  }
})

test('adds visible class when element intersects', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  act(() => {
    observerInstances[0].cb([{ isIntersecting: true }])
  })

  expect(div.classList.contains('visible')).toBe(true)
  document.body.removeChild(div)
})

test('does not add visible class when not intersecting', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  act(() => {
    observerInstances[0].cb([{ isIntersecting: false }])
  })

  expect(div.classList.contains('visible')).toBe(false)
  document.body.removeChild(div)
})

test('unobserves element after it becomes visible', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  act(() => {
    observerInstances[0].cb([{ isIntersecting: true }])
  })

  expect(observerInstances[0].observed).not.toContain(div)
  document.body.removeChild(div)
})

test('adds visible class immediately when prefers-reduced-motion is set', () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addListener: () => {},
      removeListener: () => {},
    }),
  })

  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  expect(div.classList.contains('visible')).toBe(true)
  document.body.removeChild(div)
})
