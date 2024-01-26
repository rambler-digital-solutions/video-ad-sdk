import {VideoAdContainer} from '../../../../adContainer'
import type {CancelFunction} from '../../../../types'
import {linearEvents, ErrorCode} from '../../../../tracker'

const {error} = linearEvents

export const onError = (
  {videoElement}: VideoAdContainer,
  callback: (event: string, mediaError?: MediaError) => void
): CancelFunction => {
  const errorHandler = (): void => {
    const mediaError = videoElement.error ?? undefined

    if (mediaError) {
      Object.defineProperty(mediaError, 'code', {
        get: () => ErrorCode.VAST_PROBLEM_DISPLAYING_MEDIA_FILE
      })
    }

    callback(error, mediaError)
  }

  videoElement.addEventListener('error', errorHandler)

  return () => {
    videoElement.removeEventListener('error', errorHandler)
  }
}
