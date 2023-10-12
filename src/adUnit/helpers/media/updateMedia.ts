import {MediaFile} from '../../../types'
import once from '../dom/once'

const updateMedia = (
  videoElement: HTMLVideoElement,
  mediaFile: MediaFile
): Promise<void> =>
  new Promise<void>((resolve) => {
    const state = {
      currentTime: videoElement.currentTime,
      playing: !videoElement.paused
    }

    if (state.playing) {
      videoElement.pause()
    }

    if (mediaFile.src) {
      videoElement.src = mediaFile.src
    }

    videoElement.load()

    once(videoElement, 'loadeddata', () => {
      videoElement.currentTime = state.currentTime

      if (state.playing) {
        videoElement.play()
      }

      resolve()
    })
  })

export default updateMedia
