import {MediaFile} from '../../../vastSelectors'
import guessMimeType from './guessMimeType';

const canPlay = (videoElement: HTMLVideoElement, mediaFile: MediaFile): string => {
  const {
    src,
    type
  } = mediaFile;

  return videoElement.canPlayType(type || guessMimeType(src));
};

export default canPlay;
