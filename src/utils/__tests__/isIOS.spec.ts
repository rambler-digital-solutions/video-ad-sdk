import isIOS from '../isIOS'

describe('isIOS', () => {
  let origUserAgent: string

  beforeEach(() => {
    origUserAgent = navigator.userAgent

    Object.defineProperty(navigator, 'userAgent', {
      writable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: origUserAgent,
      writable: true
    })
  })

  it('must be a function', () => {
    expect(isIOS).toBeInstanceOf(Function)
  })

  it('must return true if the useAgent contains iPad or iPod or iPhone', () => {
    expect(isIOS()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPhone ${origUserAgent}`,
      writable: true
    })
    expect(isIOS()).toBe(true)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPad ${origUserAgent}`,
      writable: true
    })
    expect(isIOS()).toBe(true)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPod ${origUserAgent}`,
      writable: true
    })
    expect(isIOS()).toBe(true)
  })

  it('must return false for IE user agents that contain iPhone', () => {
    ;(window.MSStream as any) = true

    expect(isIOS()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPhone ${origUserAgent}`,
      writable: true
    })
    expect(isIOS()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPad ${origUserAgent}`,
      writable: true
    })
    expect(isIOS()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPod ${origUserAgent}`,
      writable: true
    })
    expect(isIOS()).toBe(false)

    delete window.MSStream
  })
})
