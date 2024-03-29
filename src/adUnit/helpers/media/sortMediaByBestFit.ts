import type {MediaFile} from '../../../types'

interface RectParams {
  width: number
  height: number
  aspectRatio: number
}

const APPROXIMATION_LAPSE = 10

const getRectParams = (rect: DOMRect | MediaFile): RectParams => {
  const width = Number(rect.width) || 0
  const height = Number(rect.height) || 0

  // NOTE: leaving 1 digit after the decimal point to handle
  //       approximately equal ratios, because aspect ratio
  //       of 480p (854x480) don't strict equal to 360p (640x360)
  const aspectRatio = height
    ? Math.floor((width / height) * APPROXIMATION_LAPSE) / APPROXIMATION_LAPSE
    : 0

  return {
    aspectRatio,
    height,
    width
  }
}

export const sortMediaByBestFit = (
  mediaFiles: MediaFile[],
  screenRect: DOMRect
): MediaFile[] => {
  const screenParams = getRectParams(screenRect)

  const compareTo = (mediaFileA: MediaFile, mediaFileB: MediaFile): number => {
    const mediaFileAParams = getRectParams(mediaFileA)
    const mediaFileBParams = getRectParams(mediaFileB)

    const widthDeltaA = Math.abs(screenParams.width - mediaFileAParams.width)
    const widthDeltaB = Math.abs(screenParams.width - mediaFileBParams.width)

    const aspectRatioDeltaA = Math.abs(
      screenParams.aspectRatio - mediaFileAParams.aspectRatio
    )
    const aspectRatioDeltaB = Math.abs(
      screenParams.aspectRatio - mediaFileBParams.aspectRatio
    )

    return aspectRatioDeltaA - aspectRatioDeltaB || widthDeltaA - widthDeltaB
  }

  return mediaFiles.slice(0).sort(compareTo)
}
