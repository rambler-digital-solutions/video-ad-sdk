import {VideoAdContainer} from '../../../../adContainer'
import type {CancelFunction} from '../../../../types'
import {linearEvents} from '../../../../tracker'

const {pause, resume} = linearEvents

export const onPlayPause = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): CancelFunction => {
  let started = false
  let paused = true

  const playHandler = (): void => {
    if (!started) {
      started = true
      paused = false
    } else if (paused) {
      paused = false
      callback(resume)
    }
  }

  const pauseHandler = (): void => {
    if (!paused) {
      paused = true
      callback(pause)
    }
  }

  videoElement.addEventListener('play', playHandler)
  videoElement.addEventListener('pause', pauseHandler)

  return () => {
    videoElement.removeEventListener('play', playHandler)
    videoElement.removeEventListener('pause', pauseHandler)
  }
}
