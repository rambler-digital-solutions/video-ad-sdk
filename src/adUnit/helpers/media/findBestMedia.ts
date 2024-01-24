import {getMediaFiles} from '../../../vastSelectors'
import type {VideoAdContainer} from '../../../adContainer'
import type {ParsedAd, MediaFile, Hooks, Optional} from '../../../types'
import {canPlay} from './canPlay'
import {sortMediaByBestFit} from './sortMediaByBestFit'

const getMediaByDefaultBestFit = (
  mediaFiles: MediaFile[],
  screenRect: DOMRect
): MediaFile => {
  const [mediaFile] = sortMediaByBestFit(mediaFiles, screenRect)

  return mediaFile
}

export const findBestMedia = (
  inlineAd: ParsedAd,
  videoAdContainer: VideoAdContainer,
  {getMediaFile = getMediaByDefaultBestFit}: Hooks
): Optional<MediaFile> => {
  const {element, videoElement} = videoAdContainer
  const screenRect = element.getBoundingClientRect()
  const mediaFiles = getMediaFiles(inlineAd)
  const supportedMediaFiles = mediaFiles?.filter((mediaFile) =>
    canPlay(videoElement, mediaFile)
  )

  return supportedMediaFiles && getMediaFile(supportedMediaFiles, screenRect)
}
