import type {VastIcon} from '../../../types'

interface IFrameResourceOptions {
  document: Document
  data: VastIcon
}

export const createIframeResource = (
  source: string,
  {document, data}: IFrameResourceOptions
): HTMLIFrameElement => {
  const {height, width} = data
  const iframeElement = document.createElement('iframe')

  iframeElement.setAttribute(
    'sandbox',
    'allow-forms allow-popups allow-scripts'
  )
  iframeElement.setAttribute('loading', 'eager')

  if (width) {
    iframeElement.width = width.toString()
  }

  if (height) {
    iframeElement.height = height.toString()
  }

  iframeElement.src = source
  iframeElement.frameBorder = '0'
  iframeElement.style.border = 'none'

  return iframeElement
}
