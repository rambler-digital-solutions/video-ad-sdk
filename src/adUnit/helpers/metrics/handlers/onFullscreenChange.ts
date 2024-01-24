import {VideoAdContainer} from '../../../../adContainer'
import type {CancelFunction} from '../../../../types'
import {linearEvents} from '../../../../tracker'

const fullscreenElement = (): Element | null =>
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.mozFullScreenElement ||
  document.msFullscreenElement ||
  null

const {fullscreen, exitFullscreen, playerCollapse, playerExpand} = linearEvents

export const onFullscreenChange = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): CancelFunction => {
  const fullscreenEventNames = [
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'fullscreenchange',
    'MSFullscreenChange'
  ]
  let fullscreenOn = false
  const fullscreenchangeHandler = (): void => {
    if (fullscreenElement() === videoElement) {
      fullscreenOn = true
      callback(playerExpand)
      callback(fullscreen)
    } else if (fullscreenOn) {
      fullscreenOn = false
      callback(playerCollapse)
      callback(exitFullscreen)
    }
  }

  for (const event of fullscreenEventNames) {
    document.addEventListener(event, fullscreenchangeHandler)
  }

  return () => {
    for (const event of fullscreenEventNames) {
      document.removeEventListener(event, fullscreenchangeHandler)
    }
  }
}
