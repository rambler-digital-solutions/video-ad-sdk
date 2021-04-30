import {getMediaFiles, ParsedAd, MediaFile} from '../../../vastSelectors';
import canPlay from './canPlay';
import sortMediaByBestFit from './sortMediaByBestFit';

const findBestMedia = (inlineAd: ParsedAd, videoElement: HTMLVideoElement, container: HTMLElement): MediaFile | null => {
  const screenRect = container.getBoundingClientRect();
  const mediaFiles = getMediaFiles(inlineAd);

  if (mediaFiles) {
    const supportedMediaFiles = mediaFiles.filter((mediaFile) => canPlay(videoElement, mediaFile));
    const sortedMediaFiles = sortMediaByBestFit(supportedMediaFiles, screenRect);

    return sortedMediaFiles[0];
  }

  return null;
};

export default findBestMedia;
