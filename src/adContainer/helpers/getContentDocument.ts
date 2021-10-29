const getContentDocument = (
  iframeElement: HTMLIFrameElement
): Document | null =>
  iframeElement.contentDocument ||
  /* istanbul ignore next */
  (iframeElement.contentWindow && iframeElement.contentWindow.document);

export default getContentDocument;
