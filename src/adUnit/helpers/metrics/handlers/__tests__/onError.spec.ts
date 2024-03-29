import {linearEvents} from '../../../../../tracker'
import {onError} from '../onError'

const {error} = linearEvents
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
  Object.defineProperty(videoElement, 'error', {
    value: undefined,
    writable: true
  })
})

afterEach(() => {
  ;(videoElement as any) = null
})

test('onError must call the callback with rewind when there is an error on the current video', () => {
  const callback = jest.fn()
  const disconnect = onError({videoElement} as any, callback)
  const mockVideoError = new Error('mockVideoError')

  Object.defineProperty(videoElement, 'error', {value: mockVideoError})

  expect(callback).toHaveBeenCalledTimes(0)
  videoElement.dispatchEvent(new Event('error'))
  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenLastCalledWith(error, mockVideoError)
  callback.mockClear()

  disconnect()

  videoElement.dispatchEvent(new Event('error'))
  expect(callback).toHaveBeenCalledTimes(0)
})
