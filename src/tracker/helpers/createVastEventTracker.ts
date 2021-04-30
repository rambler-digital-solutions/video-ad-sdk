import {ParsedAd, VastChain, VastTrackingEvent} from '../../vastSelectors';
import {VastEventTrackerOptions} from '../types';
import pixelTracker from './pixelTracker';

type TrackingEventSelector = (
  ad: ParsedAd
) => VastTrackingEvent[] | string | null;

const createVastEventTracker =
  (trackingEventSelector: TrackingEventSelector) =>
  (
    vastChain: VastChain,
    {data = {}, tracker = pixelTracker}: VastEventTrackerOptions
  ): void => {
    vastChain.forEach(({ad}) => {
      const value = ad && trackingEventSelector(ad);

      if (!value) {
        return;
      }

      if (value && typeof value === 'string') {
        tracker(value, data);
        return;
      }

      if (Array.isArray(value)) {
        value.map(({uri}) => uri && tracker(uri, data));
      }
    });
  };

export default createVastEventTracker;
