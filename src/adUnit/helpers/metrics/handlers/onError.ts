import {VideoAdContainer} from '../../../../adContainer';
import {linearEvents} from '../../../../tracker';
import {Cancel} from '../../../../types';

const {error} = linearEvents;

const onError = (
  {videoElement}: VideoAdContainer,
  callback: (event: string, mediaError: MediaError | null) => void
): Cancel => {
  const errorHandler = (): void => {
    callback(error, videoElement.error);
  };

  videoElement.addEventListener('error', errorHandler);

  return () => {
    videoElement.removeEventListener('error', errorHandler);
  };
};

export default onError;
