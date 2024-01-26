import {
  createVideoAdContainer,
  VideoAdContainer
} from '../../../../../adContainer'
import {linearEvents} from '../../../../../tracker'
import {onSkip} from '../onSkip'

const {skip} = linearEvents
let videoAdContainer: VideoAdContainer
let callback: any

beforeEach(() => {
  callback = jest.fn()
  videoAdContainer = createVideoAdContainer(document.createElement('div'))

  const {videoElement} = videoAdContainer

  Object.defineProperty(videoElement, 'currentTime', {
    value: 0,
    writable: true
  })
})

afterEach(() => {
  callback = null
  ;(videoAdContainer as any) = null
})

test('onSkip must do nothing if the current time is less than the offset', () => {
  const {element, videoElement} = videoAdContainer

  onSkip(videoAdContainer, callback, {skipoffset: 5000})

  expect(element.querySelector('.mol-vast-skip-control')).toBeNull()

  videoElement.currentTime = 1
  videoElement.dispatchEvent(new Event('timeupdate'))
  expect(callback).toHaveBeenCalledTimes(0)
  expect(element.querySelector('.mol-vast-skip-control')).toBeNull()

  videoElement.currentTime = 4
  videoElement.dispatchEvent(new Event('timeupdate'))
  expect(callback).toHaveBeenCalledTimes(0)
  expect(element.querySelector('.mol-vast-skip-control')).toBeNull()

  videoElement.currentTime = 5
  videoElement.dispatchEvent(new Event('timeupdate'))
  expect(callback).toHaveBeenCalledTimes(0)
  expect(element.querySelector('.mol-vast-skip-control')).not.toBeNull()
})

test('onSkip must call the callback with skip if the user clicks in the control', () => {
  const {element, videoElement} = videoAdContainer

  onSkip(videoAdContainer, callback, {skipoffset: 5000})

  videoElement.currentTime = 5
  videoElement.dispatchEvent(new Event('timeupdate'))
  expect(callback).toHaveBeenCalledTimes(0)

  const skipControl = element.querySelector(
    '.mol-vast-skip-control'
  ) as HTMLAnchorElement

  skipControl.click()

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(skip)
})

test('onSkip must be possible to pass a skipControl factory method', () => {
  const {element, videoElement} = videoAdContainer

  onSkip(videoAdContainer, callback, {
    createSkipControl: () => {
      const skipButton = document.createElement('button')

      skipButton.classList.add('custom-skip-control')

      return skipButton
    },
    skipoffset: 5000
  })

  videoElement.currentTime = 5
  videoElement.dispatchEvent(new Event('timeupdate'))
  expect(callback).toHaveBeenCalledTimes(0)
  expect(element.querySelector('.mol-vast-skip-control')).toBeNull()

  const skipControl = element.querySelector(
    '.custom-skip-control'
  ) as HTMLButtonElement

  skipControl.click()

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(skip)
})

test('onSkip disconnect must remove the skip control if exists', () => {
  const {element, videoElement} = videoAdContainer
  const disconnect = onSkip(videoAdContainer, callback, {skipoffset: 5000})

  videoElement.currentTime = 5
  videoElement.dispatchEvent(new Event('timeupdate'))
  expect(callback).toHaveBeenCalledTimes(0)
  expect(element.querySelector('.mol-vast-skip-control')).not.toBeNull()

  disconnect()
  expect(element.querySelector('.mol-vast-skip-control')).toBeNull()
})

test('onSkip disconnect must prevent the skip control from appearing', () => {
  const {element, videoElement} = videoAdContainer
  const disconnect = onSkip(videoAdContainer, callback, {skipoffset: 5000})

  expect(element.querySelector('.mol-vast-skip-control')).toBeNull()

  disconnect()
  videoElement.currentTime = 5
  videoElement.dispatchEvent(new Event('timeupdate'))
  expect(callback).toHaveBeenCalledTimes(0)
  expect(element.querySelector('.mol-vast-skip-control')).toBeNull()
})
