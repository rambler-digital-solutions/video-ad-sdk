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
): MediaFile | null => {
  const screenRect = container.getBoundingClientRect()
  const mediaFiles = getMediaFiles(inlineAd)

  if (mediaFiles) {
    const supportedMediaFiles = mediaFiles.filter((mediaFile) =>
      canPlay(videoElement, mediaFile)
    )

    return getMediaFile(supportedMediaFiles, screenRect)
  }

  return null
}

export default findBestMedia
