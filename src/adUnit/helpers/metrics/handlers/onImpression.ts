import {VideoAdContainer} from '../../../../adContainer'
import type {CancelFunction} from '../../../../types'
import {linearEvents} from '../../../../tracker'

const {impression, creativeView} = linearEvents

export const onImpression = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): CancelFunction => {
  let started = false

  const impressionHandler = (): void => {
    const {currentTime} = videoElement

    if (!started && currentTime > 0) {
      started = true
      callback(impression)
      callback(creativeView)
      videoElement.removeEventListener('timeupdate', impressionHandler)
    }
  }

  videoElement.addEventListener('timeupdate', impressionHandler)

  return () => {
    videoElement.removeEventListener('timeupdate', impressionHandler)
  }
}
