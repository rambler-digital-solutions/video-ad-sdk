import {linearEvents} from '../../../../../tracker'
import {onFullscreenChange} from '../onFullscreenChange'

const {fullscreen, exitFullscreen, playerCollapse, playerExpand} = linearEvents

test('onFullscreenChange must call playerExpand on when going fullscreen and playerCollapse when when leaving fullscreen', () => {
  const callback = jest.fn()
  const videoElement = document.createElement('video')
  const disconnect = onFullscreenChange(
    {
      videoElement
    } as any,
    callback
  )

  Object.defineProperty(document, 'fullscreenElement', {
    value: videoElement,
    writable: true,
    configurable: true
  })
  document.dispatchEvent(new Event('fullscreenchange'))
  expect(callback).toHaveBeenCalledTimes(2)
  expect(callback).toHaveBeenCalledWith(playerExpand)
  expect(callback).toHaveBeenCalledWith(fullscreen)

  callback.mockClear()
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    writable: true,
    configurable: true
  })
  document.dispatchEvent(new Event('fullscreenchange'))
  expect(callback).toHaveBeenCalledTimes(2)
  expect(callback).toHaveBeenCalledWith(playerCollapse)
  expect(callback).toHaveBeenCalledWith(exitFullscreen)

  disconnect()
  callback.mockClear()
  Object.defineProperty(document, 'fullscreenElement', {
    value: document.createElement('video'),
    writable: true,
    configurable: true
  })
  document.dispatchEvent(new Event('fullscreenchange'))
  expect(callback).not.toHaveBeenCalled()

  delete (document as any).fullscreenElement
})
