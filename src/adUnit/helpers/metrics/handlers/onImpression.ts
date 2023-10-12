import {VideoAdContainer} from '../../../../adContainer'
import {CancelFunction} from '../../../../types'
import {linearEvents} from '../../../../tracker'

const {impression, creativeView} = linearEvents

const onImpression = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): CancelFunction => {
  let started = false

  const impressionHandler = (): void => {
    const currentTime = videoElement.currentTime

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

export default onImpression
