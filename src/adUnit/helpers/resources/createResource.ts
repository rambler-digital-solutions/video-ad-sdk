import type {VastIcon} from '../../../types'
import {createHtmlResource} from './createHtmlResource'
import {createIframeResource} from './createIframeResource'
import {createStaticResource} from './createStaticResource'

export type ResourceElement =
  | HTMLDivElement
  | HTMLIFrameElement
  | HTMLImageElement

const noopResource = document.createElement('div')

export const createResource = (
  document: Document,
  data: VastIcon
): ResourceElement => {
  const {
    staticResource,
    htmlResource,
    iFrameResource: indexFrameResource
  } = data

  if (staticResource) {
    return createStaticResource(staticResource, {
      data,
      document
    })
  }

  if (htmlResource) {
    return createHtmlResource(htmlResource, {
      data,
      document
    })
  }

  if (indexFrameResource) {
    return createIframeResource(indexFrameResource, {
      data,
      document
    })
  }

  return noopResource
}
