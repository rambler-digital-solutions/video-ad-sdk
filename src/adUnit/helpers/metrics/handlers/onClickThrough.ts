import {linearEvents} from '../../../../tracker'
import {VideoAdContainer} from '../../../../adContainer'
import {MetricHandlerData, CancelFunction} from '../../../../types'

const {clickThrough} = linearEvents

const createDefaultClickControl = (): HTMLElement => {
  const anchor = document.createElement('a')

  anchor.classList.add('mol-vast-clickthrough')
  anchor.style.width = '100%'
  anchor.style.height = '100%'
  anchor.style.position = 'absolute'
  anchor.style.left = '0'
  anchor.style.top = '0'

  return anchor
}

const onClickThrough = (
  {videoElement, element}: VideoAdContainer,
  callback: (event: string) => void,
  {
    clickThroughUrl,
    pauseOnAdClick = true,
    createClickControl = createDefaultClickControl
  }: MetricHandlerData = {}
): CancelFunction => {
  const placeholder = element || videoElement.parentNode
  const anchor = createClickControl()
  const isVirtual = !document.body.contains(anchor)

  if (isVirtual) {
    placeholder.appendChild(anchor)
  }

  if (clickThroughUrl && anchor instanceof HTMLAnchorElement) {
    anchor.href = clickThroughUrl
    anchor.target = '_blank'
  }

  anchor.onclick = (event) => {
    event.stopPropagation()

    if (videoElement.paused && pauseOnAdClick) {
      event.preventDefault()

      videoElement.play()
    } else {
      if (pauseOnAdClick) {
        videoElement.pause()
      }

      callback(clickThrough)
    }
  }

  return () => {
    if (isVirtual) {
      placeholder.removeChild(anchor)
    }
  }
}

export default onClickThrough
