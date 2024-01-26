import type {VastIcon} from '../../../types'

interface StaticResourceOptions {
  document: Document
  data: VastIcon
}

export const createStaticResource = (
  source: string,
  {document, data}: StaticResourceOptions
): HTMLImageElement => {
  const {height, width} = data
  const image = document.createElement('img')

  if (width) {
    image.width = width
  }

  if (height) {
    image.height = height
  }

  image.src = source

  return image
}
