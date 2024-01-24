import type {VastIcon} from '../../../types'
import {fetchHtml} from '../fetch/fetchHtml'

interface HtmlResourceOptions {
  document: Document
  data: VastIcon
}

export const createHtmlResource = (
  source: string,
  {document, data}: HtmlResourceOptions
): HTMLDivElement => {
  const {height, width} = data
  const divElement = document.createElement('div')

  if (width) {
    divElement.style.width = `${width}px`
  }

  if (height) {
    divElement.style.height = `${height}px`
  }

  /* eslint-disable promise/prefer-await-to-then */
  fetchHtml(source)
    .then((html) => {
      divElement.innerHTML = html

      divElement.dispatchEvent(new CustomEvent('load'))
    })
    .catch(() => {
      divElement.dispatchEvent(new CustomEvent('error'))
    })
  /* eslint-enable promise/prefer-await-to-then */

  return divElement
}
