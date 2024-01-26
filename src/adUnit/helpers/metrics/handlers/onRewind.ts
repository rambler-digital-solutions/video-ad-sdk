import {VideoAdContainer} from '../../../../adContainer'
import type {CancelFunction} from '../../../../types'
import {linearEvents} from '../../../../tracker'

const {rewind} = linearEvents

export const onRewind = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): CancelFunction => {
  let {currentTime} = videoElement

  const timeupdateHandler = (): void => {
    const delta = videoElement.currentTime - currentTime

    if (delta < 0 && Math.abs(delta) >= 1) {
      callback(rewind)
    }

    currentTime = videoElement.currentTime
  }

  videoElement.addEventListener('timeupdate', timeupdateHandler)

  return () => {
    videoElement.removeEventListener('timeupdate', timeupdateHandler)
  }
}
