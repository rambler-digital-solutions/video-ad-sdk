import {getAdErrorURI, getVastErrorURI, VastChain} from '../../vastSelectors';
import {VastEventTrackerOptions} from '../types';
import pixelTracker from './pixelTracker';

/**
 * Tracks an error.
 *
 * @param vastChain the ad VAST Chain.
 * @param options Options Map
 */
const trackError = (
  vastChain: VastChain,
  {errorCode, tracker = pixelTracker}: VastEventTrackerOptions
): void => {
  vastChain.forEach(({ad, parsedXML}) => {
    const errorURI = (ad && getAdErrorURI(ad)) || getVastErrorURI(parsedXML);

    if (errorURI) {
      tracker(errorURI, {errorCode});
    }
  });
};

export default trackError;
