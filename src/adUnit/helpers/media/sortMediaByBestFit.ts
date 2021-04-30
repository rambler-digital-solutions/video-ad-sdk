import {MediaFile} from '../../../vastSelectors'

const sortMediaByBestFit = (mediaFiles: MediaFile[], screenRect: Screen): MediaFile[] => {
  const screenWidth = screenRect.width;
  const compareTo = (mediaFileA: MediaFile, mediaFileB: MediaFile): number => {
    const deltaA = Math.abs(screenWidth - (mediaFileA.width || 0));
    const deltaB = Math.abs(screenWidth - (mediaFileB.width || 0));

    return deltaA - deltaB;
  };

  return mediaFiles.slice(0).sort(compareTo);
};

export default sortMediaByBestFit;
