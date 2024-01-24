import type {MediaFile} from '../../../types'
import {guessMimeType} from './guessMimeType'

export const canPlay = (
  videoElement: HTMLVideoElement,
  mediaFile: MediaFile
): string => {
  const {src: source, type} = mediaFile

  return videoElement.canPlayType(type || guessMimeType(source || ''))
}
