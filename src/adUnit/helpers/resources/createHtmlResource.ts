import {VastIcon} from '../../../vastSelectors'
import fetchHtml from '../fetch/fetchHtml';

interface HtmlResourceOptions {
  document: Document
  data: VastIcon
}

const createHtmlResource = (src: string, {document, data}: HtmlResourceOptions): HTMLDivElement => {
  const {
    height,
    width
  } = data;
  const divElement = document.createElement('div');

  if (width) {
    divElement.style.width = `${width}px`;
  }

  if (height) {
    divElement.style.height = `${height}px`;
  }

  fetchHtml(src)
    .then((html) => {
      divElement.innerHTML = html;

      divElement.dispatchEvent(new CustomEvent('load'));
    })
    .catch(() => {
      divElement.dispatchEvent(new CustomEvent('error'));
    });

  return divElement;
};

export default createHtmlResource;
