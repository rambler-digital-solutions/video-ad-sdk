import {getMediaFiles} from '../../../vastSelectors'
import {ParsedAd, MediaFile, Hooks} from '../../../types'
import canPlay from './canPlay'
import sortMediaByBestFit from './sortMediaByBestFit'

const getMediaByDefaultBestFit = (
  mediaFiles: MediaFile[],
  screenRect: ClientRect
): MediaFile => {
  const sortedMediaFiles = sortMediaByBestFit(mediaFiles, screenRect)

  return sortedMediaFiles[0]
}

const findBestMedia = (
  inlineAd: ParsedAd,
  videoElement: HTMLVideoElement,
  container: HTMLElement,
  {getMediaFile = getMediaByDefaultBestFit}: Hooks
): Optional<MediaFile> => {
  const screenRect = container.getBoundingClientRect()
  const mediaFiles = getMediaFiles(inlineAd)
  const supportedMediaFiles = mediaFiles?.filter(
    (mediaFile) => canPlay(videoElement, mediaFile)
  )

  return supportedMediaFiles && getMediaFile(supportedMediaFiles, screenRect)
}

export default findBestMedia
