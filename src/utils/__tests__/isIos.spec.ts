import {isIos} from '../isIos'

describe('isIos', () => {
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
    expect(isIos).toBeInstanceOf(Function)
  })

  it('must return true if the useAgent contains iPad or iPod or iPhone', () => {
    expect(isIos()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPhone ${origUserAgent}`,
      writable: true
    })
    expect(isIos()).toBe(true)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPad ${origUserAgent}`,
      writable: true
    })
    expect(isIos()).toBe(true)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPod ${origUserAgent}`,
      writable: true
    })
    expect(isIos()).toBe(true)
  })

  it('must return false for IE user agents that contain iPhone', () => {
    ;(window.MSStream as any) = true

    expect(isIos()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPhone ${origUserAgent}`,
      writable: true
    })
    expect(isIos()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPad ${origUserAgent}`,
      writable: true
    })
    expect(isIos()).toBe(false)

    Object.defineProperty(navigator, 'userAgent', {
      value: `iPod ${origUserAgent}`,
      writable: true
    })
    expect(isIos()).toBe(false)

    delete window.MSStream
  })
})
