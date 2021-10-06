import {VideoAdContainer} from '../../../../adContainer';
import {Cancel} from '../../../../types';
import {linearEvents} from '../../../../tracker';

const {rewind} = linearEvents;
const onRewind = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): Cancel => {
  let currentTime = videoElement.currentTime;

  const timeupdateHandler = (): void => {
    const delta = videoElement.currentTime - currentTime;

    if (delta < 0 && Math.abs(delta) >= 1) {
      callback(rewind);
    }

    currentTime = videoElement.currentTime;
  };

  videoElement.addEventListener('timeupdate', timeupdateHandler);

  return () => {
    videoElement.removeEventListener('timeupdate', timeupdateHandler);
  };
};

export default onRewind;
