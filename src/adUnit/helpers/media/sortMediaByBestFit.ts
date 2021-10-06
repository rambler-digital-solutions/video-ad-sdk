import {MediaFile} from '../../../types';

const sortMediaByBestFit = (
  mediaFiles: MediaFile[],
  screenRect: ClientRect
): MediaFile[] => {
  const screenWidth = screenRect.width;
  const compareTo = (mediaFileA: MediaFile, mediaFileB: MediaFile): number => {
    const widthA = mediaFileA.width;
    const widthB = mediaFileB.width;
    const deltaA = Math.abs(screenWidth - (widthA ? parseInt(widthA, 10) : 0));
    const deltaB = Math.abs(screenWidth - (widthB ? parseInt(widthB, 10) : 0));

    return deltaA - deltaB;
  };

  return mediaFiles.slice(0).sort(compareTo);
};

export default sortMediaByBestFit;
