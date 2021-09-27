import {VastIcon} from '../../../types';
import createHtmlResource from './createHtmlResource';
import createIframeResource from './createIframeResource';
import createStaticResource from './createStaticResource';

export type ResourceElement =
  | HTMLDivElement
  | HTMLIFrameElement
  | HTMLImageElement;

const createResource = (
  document: Document,
  data: VastIcon
): ResourceElement => {
  const {staticResource, htmlResource, iFrameResource} = data;

  if (staticResource) {
    return createStaticResource(staticResource, {
      data,
      document
    });
  }

  if (htmlResource) {
    return createHtmlResource(htmlResource, {
      data,
      document
    });
  }

  return createIframeResource(iFrameResource, {
    data,
    document
  });
};

export default createResource;
