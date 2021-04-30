import {VastIcon} from '../../../vastSelectors'

interface StaticResourceOptions {
  document: Document
  data: VastIcon
}

const createStaticResource = (src: string, {document, data}: StaticResourceOptions): HTMLImageElement => {
  const {
    height,
    width
  } = data;
  const image = document.createElement('img');

  if (width) {
    image.width = width;
  }

  if (height) {
    image.height = height;
  }

  image.src = src;

  return image;
};

export default createStaticResource;
