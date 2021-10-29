import {VideoAdContainer} from '../../../../adContainer';
import {Cancel} from '../../../../types';
import {linearEvents} from '../../../../tracker';

const {pause, resume} = linearEvents;

const onPlayPause = (
  {videoElement}: VideoAdContainer,
  callback: (event: string) => void
): Cancel => {
  let started = false;
  let paused = true;

  const playHandler = (): void => {
    if (!started) {
      started = true;
      paused = false;
    } else if (paused) {
      paused = false;
      callback(resume);
    }
  };

  const pauseHandler = (): void => {
    if (!paused) {
      paused = true;
      callback(pause);
    }
  };

  videoElement.addEventListener('play', playHandler);
  videoElement.addEventListener('pause', pauseHandler);

  return () => {
    videoElement.removeEventListener('play', playHandler);
    videoElement.removeEventListener('pause', pauseHandler);
  };
};

export default onPlayPause;
