import preventManualProgress from '../preventManualProgress'

describe('preventManualProgress', () => {
  let videoElement: HTMLVideoElement

  beforeEach(() => {
    videoElement = document.createElement('video')
    Object.defineProperty(videoElement, 'duration', {
      value: 100,
      writable: true
    })

    Object.defineProperty(videoElement, 'currentTime', {
      value: 0,
      writable: true
    })

    Object.defineProperty(videoElement, 'play', {
      value: jest.fn(),
      writable: true
    })

    Object.defineProperty(videoElement, 'pause', {
      value: jest.fn(),
      writable: true
    })
  })

  afterEach(() => {
    ;(videoElement as any) = null
  })

  test('must be a function', () => {
    expect(preventManualProgress).toBeInstanceOf(Function)
  })

  test('must prevent ad skip', () => {
    preventManualProgress(videoElement)
    Object.defineProperty(videoElement, 'duration', {value: 30})
    videoElement.dispatchEvent(new Event('ended'))

    expect(videoElement.pause).toHaveBeenCalledTimes(1)
  })

  test('must prevent ad seek', () => {
    preventManualProgress(videoElement)
    Object.defineProperty(videoElement, 'duration', {value: 30})
    videoElement.currentTime = 1
    videoElement.dispatchEvent(new Event('timeupdate'))

    expect(videoElement.pause).not.toHaveBeenCalled()
    expect(videoElement.currentTime).toBe(1)

    videoElement.currentTime = 5
    videoElement.dispatchEvent(new Event('timeupdate'))
    expect(videoElement.pause).not.toHaveBeenCalled()
    expect(videoElement.currentTime).toBe(1)

    videoElement.currentTime = 5
    videoElement.dispatchEvent(new Event('timeupdate'))
    expect(videoElement.pause).toHaveBeenCalledTimes(1)
    expect(videoElement.currentTime).toBe(1)
  })

  test('must return a fn to stop preventing manual progress', () => {
    const stop = preventManualProgress(videoElement)

    stop()
    Object.defineProperty(videoElement, 'duration', {value: 30})
    videoElement.dispatchEvent(new Event('ended'))

    videoElement.currentTime = 5
    videoElement.dispatchEvent(new Event('timeupdate'))
    expect(videoElement.currentTime).toBe(5)
    expect(videoElement.pause).not.toHaveBeenCalled()
  })
})
