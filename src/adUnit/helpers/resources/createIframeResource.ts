import {VastIcon} from '../../../vastSelectors'

interface IFrameResourceOptions {
  document: Document
  data: VastIcon
}

const createIframeResource = (src: string, {document, data}: IFrameResourceOptions): HTMLIFrameElement => {
  const {
    height,
    width
  } = data;
  const iframeElement = document.createElement('iframe');

  iframeElement.setAttribute('sandbox', 'allow-forms allow-popups allow-scripts');
  iframeElement.setAttribute('loading', 'eager');

  if (width) {
    iframeElement.width = width.toString();
  }

  if (height) {
    iframeElement.height = height.toString();
  }

  iframeElement.src = src;
  iframeElement.frameBorder = '0';
  iframeElement.style.border = 'none';

  return iframeElement;
};

export default createIframeResource;

