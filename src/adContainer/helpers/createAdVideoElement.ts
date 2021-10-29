const createAdVideoElement = (
  contentDocument: Document = document
): HTMLVideoElement => {
  const video = contentDocument.createElement('video');

  video.style.width = '100%';
  video.style.height = '100%';

  return video;
};

export default createAdVideoElement;
