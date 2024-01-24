import type {VastIcon} from '../../../types'

export const canBeShown = (
  icon: VastIcon,
  videoElement: HTMLVideoElement
): boolean => {
  const currentTimeInMs = videoElement.currentTime * 1000
  const videoDurationInMs = videoElement.duration * 1000
  const offset =
    typeof icon.offset === 'string'
      ? parseInt(icon.offset, 10)
      : icon.offset || 0
  const duration = icon.duration || videoDurationInMs

  return offset <= currentTimeInMs && currentTimeInMs - offset <= duration
}
