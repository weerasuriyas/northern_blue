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

  if (!global.IntersectionObserver) {
    global.IntersectionObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})
