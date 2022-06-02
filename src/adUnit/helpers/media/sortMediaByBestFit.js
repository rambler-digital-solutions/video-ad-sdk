const getRectParams = (rect) => {
  const width = rect.width || 0;
  const height = rect.height || 0;

  // NOTE: leaving 1 digit after the decimal point to handle
  //       approximately equal ratios, because aspect ratio
  //       of 480p (854x480) don't strict equal to 360p (640x360)
  const aspectRatio = height ? Math.floor(width / height * 10) / 10 : 0;

  return {
    aspectRatio,
    height,
    width
  };
};

const sortMediaByBestFit = (mediaFiles, screenRect) => {
  const screenParams = getRectParams(screenRect);

  const compareTo = (mediaFileA, mediaFileB) => {
    const mediaFileAParams = getRectParams(mediaFileA);
    const mediaFileBParams = getRectParams(mediaFileB);

    const widthDeltaA = Math.abs(screenParams.width - mediaFileAParams.width);
    const widthDeltaB = Math.abs(screenParams.width - mediaFileBParams.width);

    const aspectRatioDeltaA = Math.abs(screenParams.aspectRatio - mediaFileAParams.aspectRatio);
    const aspectRatioDeltaB = Math.abs(screenParams.aspectRatio - mediaFileBParams.aspectRatio);

    return aspectRatioDeltaA - aspectRatioDeltaB || widthDeltaA - widthDeltaB;
  };

  return mediaFiles.slice(0).sort(compareTo);
};

export default sortMediaByBestFit;
