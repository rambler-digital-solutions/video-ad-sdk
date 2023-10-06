import {VideoAdContainer} from '../../../../adContainer'
import {Cancel} from '../../../../types'
import {linearEvents} from '../../../../tracker'
import {volumeChanged} from '../../../adUnitEvents'

const {mute, unmute} = linearEvents
const isMuted = (videoElement: HTMLVideoElement): boolean =>
  videoElement.muted || videoElement.volume === 0

const onVolumeChange = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): Cancel => {
  let wasMuted = isMuted(videoElement)

  const volumechangeHandler = (): void => {
    callback(volumeChanged)

    if (wasMuted && !isMuted(videoElement)) {
      callback(unmute)
    } else if (!wasMuted && isMuted(videoElement)) {
      callback(mute)
    }

    wasMuted = isMuted(videoElement)
  }

  videoElement.addEventListener('volumechange', volumechangeHandler)

  return () => {
    videoElement.removeEventListener('volumechange', volumechangeHandler)
  }
}

export default onVolumeChange
