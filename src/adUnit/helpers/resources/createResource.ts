import {VastIcon} from '../../../vastSelectors'
import createHtmlResource from './createHtmlResource';
import createIframeResource from './createIframeResource';
import createStaticResource from './createStaticResource';

const createResource = (document: Document, data: VastIcon): HTMLDivElement | HTMLIFrameElement | HTMLImageElement => {
  const {
    staticResource,
    htmlResource,
    iFrameResource
  } = data;

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
