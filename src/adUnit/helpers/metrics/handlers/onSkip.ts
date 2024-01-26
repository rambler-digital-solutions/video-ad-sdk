import {VideoAdContainer} from '../../../../adContainer'
import type {MetricHandlerData, CancelFunction} from '../../../../types'
import {linearEvents} from '../../../../tracker'

const {skip} = linearEvents

const createDefaultSkipControl = (): HTMLButtonElement => {
  const skipButton = document.createElement('button')

  skipButton.classList.add('mol-vast-skip-control')
  skipButton.type = 'button'
  skipButton.innerHTML = 'skip'
  skipButton.style.position = 'absolute'
  skipButton.style.bottom = '15px'
  skipButton.style.right = '15px'

  return skipButton
}

export const onSkip = (
  videoAdContainer: VideoAdContainer,
  callback: (event: string) => void,
  {
    skipoffset,
    createSkipControl = createDefaultSkipControl
  }: MetricHandlerData = {}
): CancelFunction => {
  if (!skipoffset) {
    return () => null
  }

  let skipControl: HTMLElement
  const {videoElement, element} = videoAdContainer

  const skipHandler = (): void => {
    const currentTimeMs = videoElement.currentTime * 1000

    if (
      !skipControl &&
      typeof skipoffset === 'number' &&
      currentTimeMs >= skipoffset
    ) {
      skipControl = createSkipControl()

      skipControl.onclick = (event) => {
        event.stopPropagation?.()

        callback(skip)

        return false
      }

      element.appendChild(skipControl)
      videoElement.removeEventListener('timeupdate', skipHandler)
    }
  }

  videoElement.addEventListener('timeupdate', skipHandler)

  return () => {
    videoElement.removeEventListener('timeupdate', skipHandler)

    if (skipControl) {
      element.removeChild(skipControl)
    }
  }
}
