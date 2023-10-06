import {VideoAdContainer} from '../../../../adContainer';
import {linearEvents, ErrorCode} from '../../../../tracker';
import {Cancel} from '../../../../types';

const {error} = linearEvents;

const onError = (
  {videoElement}: VideoAdContainer,
  callback: (event: string, mediaError: MediaError | null) => void
): Cancel => {
  const errorHandler = (): void => {
    const mediaError = videoElement.error;

    Object.defineProperty(mediaError, 'code', {
      get: () => ErrorCode.VAST_PROBLEM_DISPLAYING_MEDIA_FILE
    });

    callback(error, mediaError);
  };

  videoElement.addEventListener('error', errorHandler);

  return () => {
    videoElement.removeEventListener('error', errorHandler);
  };
};

export default onError;
