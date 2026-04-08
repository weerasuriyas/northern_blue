import '@testing-library/jest-dom'

// Install fallback stubs before each test so they are always clean.
// useFadeIn.test.jsx overrides these with richer spies in its own beforeEach.
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
    }),
  })

  // Always install unconditionally; useFadeIn.test.jsx overrides with a richer spy in its own beforeEach
  global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})
