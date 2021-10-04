import VideoAdContainer from './VideoAdContainer';

/**
 * VideoAdContainer factory method. Returns a VideoAdContainer instance that will contain the video ad.
 *
 * @ignore
 * @param placeholder Placeholder element that will contain the video ad.
 * @param videoElement Optional videoElement that will be used to play the ad.
 *
 * @returns Returns a `VideoAdContainer` instance.
 */
const createVideoAdContainer = (
  placeholder: HTMLElement,
  videoElement?: HTMLVideoElement
): VideoAdContainer => {
  if (!placeholder) {
    throw new TypeError('placeholder is required');
  }

  return new VideoAdContainer(placeholder, videoElement);
};

export default createVideoAdContainer;
