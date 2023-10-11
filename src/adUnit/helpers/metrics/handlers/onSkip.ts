import {VideoAdContainer} from '../../../../adContainer'
import {MetricHandlerData, Cancel} from '../../../../types'
import {linearEvents} from '../../../../tracker'

const {skip} = linearEvents
const createDefaultSkipControl = (): HTMLButtonElement => {
  const skipBtn = document.createElement('button')

  skipBtn.classList.add('mol-vast-skip-control')
  skipBtn.type = 'button'
  skipBtn.innerHTML = 'skip'
  skipBtn.style.position = 'absolute'
  skipBtn.style.bottom = '15px'
  skipBtn.style.right = '15px'

  return skipBtn
}

const onSkip = (
  videoAdContainer: VideoAdContainer,
  callback: (event: string) => void,
  {
    skipoffset,
    createSkipControl = createDefaultSkipControl
  }: MetricHandlerData = {}
): Cancel => {
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

export default onSkip
