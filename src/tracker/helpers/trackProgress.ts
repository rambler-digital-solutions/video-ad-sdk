import {VastChain} from '../../vastSelectors';
import {VastEventTrackerOptions} from '../types';
import pixelTracker from './pixelTracker';

const trackProgress = (
  _vastChain: VastChain,
  {data = {}, tracker = pixelTracker}: VastEventTrackerOptions
): void => {
  const {progressUri} = data;

  if (Boolean(progressUri)) {
    tracker(progressUri, {...data});
  }
};

export default trackProgress;
