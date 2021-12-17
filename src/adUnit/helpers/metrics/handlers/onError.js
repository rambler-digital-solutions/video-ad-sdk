/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {linearEvents, errorCodes} from '../../../../tracker';

const {error} = linearEvents;

const onError = ({videoElement}, callback) => {
  const errorHandler = () => {
    const mediaError = videoElement.error;

    mediaError.code = errorCodes.VAST_PROBLEM_DISPLAYING_MEDIA_FILE;

    callback(error, mediaError);
  };

  videoElement.addEventListener('error', errorHandler);

  return () => {
    videoElement.removeEventListener('error', errorHandler);
  };
};

export default onError;
